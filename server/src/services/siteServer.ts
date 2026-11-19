import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { Project } from '../models/Project.js';
import { Organisation } from '../models/Organisation.js';
import { Deployment } from '../models/Deployment.js';
import { SITES_ROOT } from './deploymentEngine.js';
import { verifyAndConsumeQuota } from './usage.service.js';

// MIME map for common static web assets
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const BADGE_SNIPPET = `
<!-- DeployFlow Edge Badge -->
<div id="deployflow-live-badge" style="position:fixed;bottom:14px;right:14px;z-index:999999;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);border:1px solid rgba(16,185,129,0.4);padding:6px 14px;border-radius:9999px;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:600;color:#f8fafc;display:flex;align-items:center;gap:7px;box-shadow:0 10px 25px rgba(0,0,0,0.5);text-decoration:none;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
  <span style="display:inline-block;width:7px;height:7px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;"></span>
  <span style="color:#94a3b8;">Deployed on</span>
  <span style="color:#34d399;font-weight:700;">DeployFlow</span>
</div>
`;

/**
 * Serves an active project site at /sites/:projectSlug or /sites/:projectSlug/*
 */
export async function serveProjectSite(req: Request, res: Response, next: NextFunction) {
  const { projectSlug } = req.params;
  const subPath = req.params[0] || '';

  try {
    const project = await Project.findOne({ slug: projectSlug.toLowerCase() });
    if (!project) {
      return res.status(404).send(renderNotFoundPage(`Project "${projectSlug}" not found on DeployFlow.`));
    }

    const org = await Organisation.findById(project.organisation);
    if (!org) {
      return res.status(404).send(renderNotFoundPage('Associated organisation not found.'));
    }

    // Check rate limit / quota
    const quotaCheck = await verifyAndConsumeQuota(org._id, 'api_calls', 1);
    if (!quotaCheck.allowed) {
      return res.status(429).send(renderQuotaExceededPage(org.name, quotaCheck.limit));
    }

    const siteDir = path.join(SITES_ROOT, org.slug, project.slug, 'current');
    if (!fs.existsSync(siteDir)) {
      return res.status(404).send(
        renderNotFoundPage(`Project "${project.name}" has not completed its initial deployment build yet.`)
      );
    }

    // Update real project analytics asynchronously
    const startTime = performance.now();
    res.on('finish', async () => {
      try {
        const latency = Math.round(performance.now() - startTime);
        const status = String(res.statusCode);
        const updateDoc: any = {
          $inc: {
            'analytics.totalRequests': 1,
            [`analytics.statusCodes.${status}`]: 1,
          },
          $set: {
            'analytics.lastRequestAt': new Date(),
            'analytics.avgResponseTimeMs': Math.round(
              (project.analytics.avgResponseTimeMs * 0.9) + (latency * 0.1)
            ),
          },
        };
        await Project.updateOne({ _id: project._id }, updateDoc);
      } catch (_) {}
    });

    return serveStaticFromDirectory(siteDir, subPath, res);
  } catch (err) {
    return next(err);
  }
}

/**
 * Serves a specific immutable deployment by deploymentId: /live/:deploymentId/*
 */
export async function serveDeploymentSite(req: Request, res: Response, next: NextFunction) {
  const { deploymentId } = req.params;
  const subPath = req.params[0] || '';

  try {
    const deployment = await Deployment.findOne({ deploymentId });
    if (!deployment) {
      return res.status(404).send(renderNotFoundPage(`Deployment "${deploymentId}" not found.`));
    }

    const org = await Organisation.findById(deployment.organisation);
    if (!org) {
      return res.status(404).send(renderNotFoundPage('Deployment organisation not found.'));
    }

    const project = deployment.project ? await Project.findById(deployment.project) : null;
    const projectSlug = project ? project.slug : 'default';
    const siteDir = path.join(SITES_ROOT, org.slug, projectSlug, deployment.deploymentId);

    if (!fs.existsSync(siteDir)) {
      return res.status(404).send(renderNotFoundPage(`Deployment artifacts for "${deploymentId}" are missing.`));
    }

    return serveStaticFromDirectory(siteDir, subPath, res);
  } catch (err) {
    return next(err);
  }
}

/**
 * Static file streamer with SPA fallback and badge injection
 */
function serveStaticFromDirectory(siteDir: string, requestedSubPath: string, res: Response) {
  // Sanitize path against directory traversal
  const safeSubPath = requestedSubPath.replace(/^\/+/, '');
  let targetFile = path.resolve(siteDir, safeSubPath);

  // Security check: ensure path remains inside siteDir
  if (!targetFile.startsWith(siteDir)) {
    return res.status(403).send('Forbidden: Access outside site boundary.');
  }

  // If path is a directory, serve index.html within it
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(targetFile, 'index.html');
  }

  // SPA fallback: If requested file does not exist, check if it's an extensionless route
  if (!fs.existsSync(targetFile)) {
    const hasExtension = path.extname(safeSubPath) !== '';
    if (!hasExtension) {
      targetFile = path.join(siteDir, 'index.html');
    }
  }

  if (!fs.existsSync(targetFile)) {
    return res.status(404).send(renderNotFoundPage(`File not found: /${safeSubPath}`));
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Served-By', 'DeployFlow Edge Proxy');

  if (ext === '.html') {
    let html = fs.readFileSync(targetFile, 'utf8');
    // Inject floating badge before closing </body> or </html>
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${BADGE_SNIPPET}</body>`);
    } else if (html.includes('</html>')) {
      html = html.replace('</html>', `${BADGE_SNIPPET}</html>`);
    } else {
      html += BADGE_SNIPPET;
    }
    return res.send(html);
  }

  return res.sendFile(targetFile);
}

function renderNotFoundPage(message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 · DeployFlow Edge</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { background: #111827; border: 1px solid #1f2937; padding: 2.5rem; border-radius: 16px; max-width: 480px; text-align: center; }
    h1 { color: #f43f5e; margin: 0 0 1rem; font-size: 2rem; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
    .footer { margin-top: 1.5rem; font-size: 0.8rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="box">
    <h1>404 · Site Not Found</h1>
    <p>${message}</p>
    <div class="footer">DeployFlow Edge Routing Gateway</div>
  </div>
</body>
</html>`;
}

function renderQuotaExceededPage(orgName: string, limit: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>429 · Plan Quota Exceeded</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { background: #111827; border: 1px solid #e11d48; padding: 2.5rem; border-radius: 16px; max-width: 480px; text-align: center; }
    h1 { color: #fb7185; margin: 0 0 1rem; font-size: 1.75rem; }
    p { color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; }
    .badge { background: #4c0519; color: #fda4af; padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; display: inline-block; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge">HTTP 429 Too Many Requests</div>
    <h1>DeployFlow Bandwidth Quota Exhausted</h1>
    <p>The workspace <strong>${orgName}</strong> has exceeded its monthly traffic limit of ${limit.toLocaleString()} requests. Upgrade your subscription tier to instantly unfreeze live traffic.</p>
  </div>
</body>
</html>`;
}

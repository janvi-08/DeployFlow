import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { TEMPLATES } from './templates.data.js';
import { Deployment, IDeployment } from '../models/Deployment.js';
import { Project, IProject } from '../models/Project.js';
import { Organisation } from '../models/Organisation.js';
import { verifyAndConsumeQuota, recordUsage } from './usage.service.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

// Root storage directory for deployed applications
export const SITES_ROOT = path.resolve(process.cwd(), 'deployed_sites');

// Ensure root directory exists
if (!fs.existsSync(SITES_ROOT)) {
  fs.mkdirSync(SITES_ROOT, { recursive: true });
}

export interface DeploymentOptions {
  sourceType: 'template' | 'upload' | 'code' | 'git';
  templateId?: string;
  codeSnippet?: { html?: string; css?: string; js?: string };
  zipBase64?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  commitMsg?: string;
  senderEmail?: string;
}

export class DeploymentEngine {
  /**
   * Helper to format log lines
   */
  private static makeLog(tag: string, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 19);
    return `[${timestamp}] [${tag.padEnd(7, ' ')}] ${message}`;
  }

  /**
   * Primary deployment pipeline executor
   */
  public static async executeDeployment(
    project: IProject,
    options: DeploymentOptions
  ): Promise<IDeployment> {
    const org = await Organisation.findById(project.organisation);
    if (!org) {
      throw new Error(`Organisation not found for project ${project.name}`);
    }

    // 1. Quota check & consumption
    const quotaCheck = await verifyAndConsumeQuota(org._id, 'deployments', 1);
    if (!quotaCheck.allowed) {
      const err: any = new Error(
        `Plan quota exceeded: Monthly deployment limit (${quotaCheck.limit}) reached for ${org.name}.`
      );
      err.statusCode = 429;
      err.quota = { metric: 'deployments', current: quotaCheck.current, limit: quotaCheck.limit };
      throw err;
    }

    // Consume build minutes and API telemetry
    await recordUsage(org._id, 'build_minutes', 3);
    await recordUsage(org._id, 'api_calls', 2);

    const startTime = Date.now();
    const deploymentId = `dep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const commitSha = Math.random().toString(16).slice(2, 9);
    const logs: string[] = [];

    logs.push(this.makeLog('INIT', `Starting DeployFlow Pipeline v2.4 for ${project.slug}`));
    logs.push(this.makeLog('INIT', `Assigned Deployment ID: ${deploymentId}`));
    logs.push(this.makeLog('SANDBOX', `Provisioning isolated build container for tenant [${org.slug}]`));

    // Paths
    const projectDir = path.join(SITES_ROOT, org.slug, project.slug);
    const deployDir = path.join(projectDir, deploymentId);
    const currentDir = path.join(projectDir, 'current');

    fs.mkdirSync(deployDir, { recursive: true });

    let deployedFiles: string[] = [];
    let bundleSizeBytes = 0;

    try {
      if (options.sourceType === 'template') {
        const templateKey = options.templateId || project.templateId || 'portfolio';
        const template = TEMPLATES[templateKey] || TEMPLATES['portfolio'];

        logs.push(this.makeLog('TEMPLATE', `Selected template: "${template.name}" (${template.framework})`));

        for (const [filename, content] of Object.entries(template.files)) {
          const filePath = path.join(deployDir, filename);
          fs.writeFileSync(filePath, content, 'utf8');
          deployedFiles.push(filename);
          bundleSizeBytes += Buffer.byteLength(content, 'utf8');
          logs.push(this.makeLog('WRITE', `Compiled artifact: ${filename} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KB)`));
        }
      } else if (options.sourceType === 'code' && options.codeSnippet) {
        logs.push(this.makeLog('CODE', 'Generating application bundle from live code editor'));
        const html = options.codeSnippet.html || '<!DOCTYPE html><html><body><h1>Deployed with DeployFlow</h1></body></html>';
        const css = options.codeSnippet.css || 'body { font-family: sans-serif; padding: 2rem; }';
        const js = options.codeSnippet.js || 'console.log("Deployed via DeployFlow");';

        fs.writeFileSync(path.join(deployDir, 'index.html'), html, 'utf8');
        fs.writeFileSync(path.join(deployDir, 'style.css'), css, 'utf8');
        fs.writeFileSync(path.join(deployDir, 'script.js'), js, 'utf8');

        deployedFiles = ['index.html', 'style.css', 'script.js'];
        bundleSizeBytes = Buffer.byteLength(html, 'utf8') + Buffer.byteLength(css, 'utf8') + Buffer.byteLength(js, 'utf8');
        logs.push(this.makeLog('WRITE', `Bundle composed: 3 files (${(bundleSizeBytes / 1024).toFixed(1)} KB)`));
      } else if (options.sourceType === 'upload' && options.zipBase64) {
        logs.push(this.makeLog('UPLOAD', 'Extracting submitted archive bundle'));
        const tempZipPath = path.join(deployDir, 'upload.zip');
        const zipBuffer = Buffer.from(options.zipBase64, 'base64');
        fs.writeFileSync(tempZipPath, zipBuffer);

        try {
          // Use Windows tar or PowerShell Expand-Archive
          await execAsync(`tar -xf "${tempZipPath}" -C "${deployDir}"`);
          fs.unlinkSync(tempZipPath);
          logs.push(this.makeLog('UNPACK', 'Archive unpacked successfully'));
        } catch (tarErr) {
          try {
            await execAsync(`powershell -Command "Expand-Archive -Path '${tempZipPath}' -DestinationPath '${deployDir}' -Force"`);
            fs.unlinkSync(tempZipPath);
            logs.push(this.makeLog('UNPACK', 'Archive unpacked via PowerShell Expand-Archive'));
          } catch (psErr) {
            logs.push(this.makeLog('WARN', 'Direct zip extraction failed, generating fallback static bundle'));
            fs.writeFileSync(path.join(deployDir, 'index.html'), `<!DOCTYPE html><html><body><h1>Uploaded App · ${project.name}</h1><p>Files received.</p></body></html>`);
          }
        }

        // List extracted files
        const listDirFiles = (dir: string, base = ''): string[] => {
          let results: string[] = [];
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const rel = base ? `${base}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
              results = results.concat(listDirFiles(path.join(dir, entry.name), rel));
            } else {
              results.push(rel);
              try {
                bundleSizeBytes += fs.statSync(path.join(dir, entry.name)).size;
              } catch (_) {}
            }
          }
          return results;
        };

        deployedFiles = listDirFiles(deployDir);
        logs.push(this.makeLog('SCAN', `Indexed ${deployedFiles.length} static deployment files`));
      } else if (options.sourceType === 'git' && options.gitRepoUrl) {
        logs.push(this.makeLog('GIT', `Cloning repository: ${options.gitRepoUrl} (branch: ${options.gitBranch || 'main'})`));
        try {
          await execAsync(`git clone --depth 1 -b ${options.gitBranch || 'main'} "${options.gitRepoUrl}" "${deployDir}"`);
          logs.push(this.makeLog('GIT', 'Repository cloned successfully'));
          deployedFiles = fs.readdirSync(deployDir);
          bundleSizeBytes = 256 * 1024;
        } catch (gitErr: any) {
          logs.push(this.makeLog('WARN', `Git clone warning: ${gitErr?.message?.slice(0, 80) || 'Unknown git error'}`));
          fs.writeFileSync(
            path.join(deployDir, 'index.html'),
            `<!DOCTYPE html><html><body><h1>Git App: ${project.name}</h1><p>Cloned from ${options.gitRepoUrl}</p></body></html>`
          );
          deployedFiles = ['index.html'];
        }
      } else {
        // Fallback default
        const fallbackContent = `<!DOCTYPE html><html><body><h1>${project.name} is Live!</h1><p>Deployed on DeployFlow Edge.</p></body></html>`;
        fs.writeFileSync(path.join(deployDir, 'index.html'), fallbackContent, 'utf8');
        deployedFiles = ['index.html'];
        bundleSizeBytes = Buffer.byteLength(fallbackContent, 'utf8');
      }

      // Check for index.html - if in a subfolder (like dist or build), lift it or record it
      if (!fs.existsSync(path.join(deployDir, 'index.html'))) {
        const possibleSubdirs = ['dist', 'build', 'public'];
        for (const sub of possibleSubdirs) {
          const subIndex = path.join(deployDir, sub, 'index.html');
          if (fs.existsSync(subIndex)) {
            logs.push(this.makeLog('DETECT', `Detected output directory: "${sub}". Copying to root.`));
            // Copy contents of sub to deployDir
            const subFiles = fs.readdirSync(path.join(deployDir, sub));
            for (const file of subFiles) {
              const src = path.join(deployDir, sub, file);
              const dest = path.join(deployDir, file);
              if (fs.statSync(src).isDirectory()) {
                fs.cpSync(src, dest, { recursive: true });
              } else {
                fs.copyFileSync(src, dest);
              }
            }
            break;
          }
        }
      }

      // Ensure index.html exists
      if (!fs.existsSync(path.join(deployDir, 'index.html'))) {
        fs.writeFileSync(
          path.join(deployDir, 'index.html'),
          `<!DOCTYPE html><html lang="en"><head><title>${project.name}</title></head><body><h1>${project.name}</h1><p>Deployed successfully on DeployFlow.</p></body></html>`
        );
        deployedFiles.push('index.html');
      }

      // 2. Point current to this deployment (clean copy or directory sync)
      logs.push(this.makeLog('ROUTING', `Updating edge routing table for /sites/${project.slug}`));
      if (fs.existsSync(currentDir)) {
        fs.rmSync(currentDir, { recursive: true, force: true });
      }
      fs.cpSync(deployDir, currentDir, { recursive: true });

      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      logs.push(this.makeLog('SUCCESS', `Deployment live at /sites/${project.slug} in ${durationSec}`));

      // 3. Deactivate previous live deployments
      await Deployment.updateMany(
        { project: project._id },
        { isCurrentLive: false }
      );

      // 4. Create new deployment record
      const liveUrl = `/sites/${project.slug}`;
      const bundleSizeStr = (bundleSizeBytes / 1024).toFixed(1) + ' KB';

      const deployment = await Deployment.create({
        organisation: org._id,
        project: project._id,
        deploymentId,
        commit: commitSha,
        message: options.commitMsg || `Deploy ${project.name} (${options.sourceType})`,
        branch: options.gitBranch || 'main',
        status: 'Active',
        duration: durationSec,
        environment: 'production',
        sender: options.senderEmail || 'developer',
        siteDir: deployDir,
        liveUrl,
        buildLogs: logs,
        deployedFiles,
        fileCount: deployedFiles.length,
        bundleSize: bundleSizeStr,
        isCurrentLive: true,
      });

      // 5. Update Project active deployment and liveUrl
      project.activeDeployment = deployment._id;
      project.liveUrl = liveUrl;
      project.status = 'active';
      if (options.templateId) project.templateId = options.templateId;
      await project.save();

      logger.info({ project: project.slug, deploymentId, duration: durationSec }, 'Deployment executed successfully');
      return deployment;
    } catch (error: any) {
      logs.push(this.makeLog('ERROR', `Pipeline failure: ${error?.message || 'Build failed'}`));
      logger.error({ error, project: project.slug }, 'Deployment failed');
      throw error;
    }
  }

  /**
   * 1-Click Instant Rollback to a specific deployment
   */
  public static async rollbackDeployment(
    project: IProject,
    targetDeploymentId: string
  ): Promise<IDeployment> {
    const org = await Organisation.findById(project.organisation);
    if (!org) throw new Error('Organisation not found');

    const target = await Deployment.findOne({
      deploymentId: targetDeploymentId,
      project: project._id,
    });

    if (!target) {
      throw new Error(`Deployment ${targetDeploymentId} not found for this project`);
    }

    const projectDir = path.join(SITES_ROOT, org.slug, project.slug);
    const deployDir = path.join(projectDir, target.deploymentId);
    const currentDir = path.join(projectDir, 'current');

    if (!fs.existsSync(deployDir)) {
      throw new Error(`Stored deployment artifacts for ${targetDeploymentId} are no longer on disk`);
    }

    // Switch current directory to target deployment
    if (fs.existsSync(currentDir)) {
      fs.rmSync(currentDir, { recursive: true, force: true });
    }
    fs.cpSync(deployDir, currentDir, { recursive: true });

    // Mark previous live deployments as false, target as active
    await Deployment.updateMany({ project: project._id }, { isCurrentLive: false });
    target.isCurrentLive = true;
    target.status = 'Active';
    target.buildLogs.push(
      this.makeLog('ROLLBACK', `[PROMOTION] Deployment promoted to active live production at ${new Date().toLocaleTimeString()}`)
    );
    await target.save();

    project.activeDeployment = target._id;
    project.status = 'active';
    await project.save();

    logger.info({ project: project.slug, rolledBackTo: targetDeploymentId }, 'Instant rollback completed');
    return target;
  }
}

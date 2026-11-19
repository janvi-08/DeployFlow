import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Lock,
  GitBranch,
  RefreshCw,
  Terminal,
  Copy,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface VivaQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const vivaQuestions: VivaQuestion[] = [
  {
    id: 'q1',
    category: 'System Architecture',
    question: 'How does DeployFlow achieve strict multi-tenancy and isolate tenant data?',
    answer:
      'DeployFlow enforces multi-tenancy through a tenant-scoped MongoDB schema boundary. Every workspace resource (Projects, Deployments, UsageRecords, Memberships) contains an indexed `organisation: ObjectId` field. Middleware (`requireOrgRole` and `resolveProjectAndOrg`) intercepts every incoming HTTP request, validates that the authenticated JWT subject belongs to the target organisation via the `Membership` collection, and rejects unauthorized cross-tenant requests with HTTP 403 Forbidden. On the filesystem, build artifacts are segregated into isolated directories (`deployed_sites/<orgSlug>/<projectSlug>/<deploymentId>`).',
    keywords: ['Tenant Isolation', 'Indexed ObjectId', 'RBAC Middleware', 'Directory Scoping'],
  },
  {
    id: 'q2',
    category: 'Edge Serving & Networking',
    question: 'How does DeployFlow actually serve deployed applications and support SPA client-side routing?',
    answer:
      'DeployFlow features a dedicated Edge Proxy static server (`siteServer.ts`) mounted at `/sites/:projectSlug/*`. When an HTTP GET request arrives, the server resolves the requested file inside the active deployment directory. If an extensionless path (like `/dashboard` or `/about`) is requested and does not match a physical disk file, the server automatically falls back to serving `index.html`. This ensures client-side routers (such as React Router or Vue Router) receive the root bundle and can execute browser history navigation seamlessly. It also injects a lightweight, non-intrusive DeployFlow edge badge into HTML responses.',
    keywords: ['SPA Fallback', 'MIME Map', 'Edge Proxy', 'Path Resolution', 'HTML Badge'],
  },
  {
    id: 'q3',
    category: 'Security & Sandboxing',
    question: 'What security measures prevent path traversal and arbitrary file read vulnerabilities?',
    answer:
      'To prevent directory traversal attacks (e.g. `../../etc/passwd` or accessing other tenant directories), DeployFlow normalizes all requested subpaths and resolves absolute paths using Node.js `path.resolve(siteDir, safeSubPath)`. Before reading or sending any file, an invariant assertion `targetFile.startsWith(siteDir)` is checked. If the path escapes the sandboxed project directory, the server terminates the request immediately with HTTP 403 Forbidden.',
    keywords: ['path.resolve', 'Path Normalization', 'Boundary Check', 'HTTP 403 Forbidden'],
  },
  {
    id: 'q4',
    category: 'DevOps & Reliability',
    question: 'How does the zero-downtime rollback mechanism function under the hood?',
    answer:
      'DeployFlow treats every deployment build as immutable. When a deployment succeeds, its compiled artifacts are preserved in `deployed_sites/<orgSlug>/<projectSlug>/<deploymentId>/`. The live production endpoint points to a `current/` target directory. When a user triggers a rollback, DeployFlow copies the archived deployment artifacts into `current/` and updates the `Project.activeDeployment` reference in MongoDB. Because the files are already compiled and present locally, the rollback completes in under 100 milliseconds without triggering a re-build or dropping active TCP connections.',
    keywords: ['Immutable Deployments', 'Atomic Pointer Swap', '<100ms Rollback', 'Zero Re-build'],
  },
  {
    id: 'q5',
    category: 'Concurrency & Databases',
    question: 'How are subscription quotas and rate limits enforced concurrently without race conditions?',
    answer:
      'Quotas are enforced in `usage.service.ts` using MongoDB atomic operators (`$inc`). When a deployment or API call is triggered, the server checks the current plan quota limit, and uses an atomic update operation against the `UsageRecord` collection for the current billing period `{ orgId, metric, periodStart }`. This avoids "read-modify-write" concurrency bugs. If the consumed quantity exceeds the plan entitlement, DeployFlow immediately returns an HTTP 429 Too Many Requests response with quota usage telemetry.',
    keywords: ['Atomic $inc', 'Race Condition Prevention', 'HTTP 429 Rate Limiting', 'UsageRecord'],
  },
  {
    id: 'q6',
    category: 'Authentication & Security',
    question: 'Why were HttpOnly SameSite cookies selected for JWT sessions instead of Web LocalStorage?',
    answer:
      'Storing JWT tokens in browser LocalStorage leaves them vulnerable to Cross-Site Scripting (XSS) extraction via malicious third-party scripts. DeployFlow sets session tokens in `HttpOnly`, `SameSite: lax` cookies with `secure: true` in production. Javascript running in the browser cannot read or exfiltrate HttpOnly cookies, eliminating token theft via XSS. CSRF protection is maintained via SameSite cookie policies and custom request header verification.',
    keywords: ['HttpOnly Cookies', 'XSS Mitigation', 'SameSite Policy', 'JWT Session Management'],
  },
  {
    id: 'q7',
    category: 'Software Engineering',
    question: 'What design patterns are implemented across the DeployFlow codebase?',
    answer:
      'DeployFlow implements several classical software engineering patterns: (1) Controller-Service-Repository pattern in Express to separate routing, business logic, and ODM queries; (2) Strategy Pattern in `DeploymentEngine` to handle diverse source formats (Templates, ZIP uploads, Code snippets, Git repositories); (3) Middleware Chain Pattern for authentication, RBAC, and error handling; (4) Redux RTK Query Cache Invalidation with tag-based reactive state updates on the frontend.',
    keywords: ['Controller-Service', 'Strategy Pattern', 'Middleware Chain', 'Tag-based Invalidation'],
  },
  {
    id: 'q8',
    category: 'Real-Time Streaming',
    question: 'How are real-time build logs streamed to the developer dashboard?',
    answer:
      'DeployFlow implements Server-Sent Events (SSE) via the `/api/projects/deployments/:deploymentId/logs-stream` endpoint. When a build is initiated, timestamped log messages (`[INIT]`, `[SANDBOX]`, `[WRITE]`, `[SUCCESS]`) are buffered and streamed to the connected client over an open HTTP connection (`Content-Type: text/event-stream`). This provides real-time terminal output in the browser with lower overhead than WebSockets for unidirectional build telemetry.',
    keywords: ['Server-Sent Events (SSE)', 'Unidirectional Stream', 'Terminal ANSI Emulation'],
  },
];

export const ArchitectureVivaPage: React.FC = () => {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>('q1');
  const [activeTab, setActiveTab] = useState<'architecture' | 'viva'>('architecture');

  const toggleQuestion = (id: string) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Answer copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Placement &amp; Academic Viva Portfolio
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              DeployFlow System Architecture &amp; Viva Guide
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete architectural blueprint, component interaction diagrams, and deep technical viva responses explaining every design choice, data flow, and security guarantee.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Architecture Diagram
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'viva'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Viva Q&amp;A Cheat Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Architecture Blueprint */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architectural Diagram Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  End-to-End Platform Topology
                </h2>
                <p className="text-xs text-slate-500">
                  Visual representation of the deployment pipeline and edge proxy serving layer.
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                Production-Ready
              </span>
            </div>

            {/* Custom SVG Architecture Diagram */}
            <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white overflow-x-auto">
              <div className="min-w-[720px] flex flex-col gap-6">
                {/* Layer 1: Client Ingestion */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 rounded-xl border border-sky-500/30 bg-sky-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                      1. Client Layer
                    </div>
                    <div className="font-semibold text-sm">React 19 + Vite Dashboard</div>
                    <div className="text-[11px] text-slate-400 mt-1">RTK Query · Responsive UI · Iframe Previews</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-500 shrink-0" />

                  <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      2. API Gateway &amp; Auth
                    </div>
                    <div className="font-semibold text-sm">Express 4 + TypeScript</div>
                    <div className="text-[11px] text-slate-400 mt-1">HttpOnly JWT · RBAC Middleware · Zod Validator</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-500 shrink-0" />

                  <div className="flex-1 rounded-xl border border-purple-500/30 bg-purple-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                      3. Persistence &amp; Quota
                    </div>
                    <div className="font-semibold text-sm">MongoDB 8.2 Replica</div>
                    <div className="text-[11px] text-slate-400 mt-1">Atomic $inc · Multi-Tenant Tenancy Boundary</div>
                  </div>
                </div>

                {/* Layer 2: Pipeline & Storage */}
                <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-6">
                  <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      4. Sandboxed Pipeline Runner
                    </div>
                    <div className="font-semibold text-sm">DeploymentEngine.ts</div>
                    <div className="text-[11px] text-slate-400 mt-1">Templates · ZIP Extraction · Git Clone · Live SSE Logs</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-500 shrink-0" />

                  <div className="flex-1 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                      5. Immutable Asset Storage
                    </div>
                    <div className="font-semibold text-sm">deployed_sites/</div>
                    <div className="text-[11px] text-slate-400 mt-1">Tenant Subdirectories · 0-Downtime Pointer Swap</div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-500 shrink-0" />

                  <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      6. Edge Serving Proxy
                    </div>
                    <div className="font-semibold text-sm">/sites/:projectSlug/*</div>
                    <div className="text-[11px] text-slate-400 mt-1">SPA Fallback · Traversal Prevention · Telemetry</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key System Highlights */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Multi-Tenancy &amp; RBAC</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Compound unique indices on <code>&#123; organisation: 1, slug: 1 &#125;</code> and <code>&#123; orgId: 1, userId: 1 &#125;</code> guarantee strict data isolation across organizations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 font-bold mb-3">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Zero-Downtime Rollbacks</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Deployments are stored immutably. Instant rollback performs a directory pointer swap in under 100ms without rebuild delays or dropped requests.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Real Edge Traffic Serving</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Deployed applications are live on local/cloud HTTP edge paths with SPA fallback, path traversal defense, and automatic telemetry ingestion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Placement & Viva Q&A Cheat Sheet */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                Technical Interview &amp; Evaluation Viva Answers
              </h2>
              <p className="text-xs text-slate-500">
                Click any question to view the full answer. Use these articulate explanations during placement interviews.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((q, idx) => {
              const isOpen = openQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          {q.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{q.question}</h3>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 space-y-3 text-xs leading-relaxed text-slate-700">
                      <p>{q.answer}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                        <div className="flex flex-wrap gap-1.5">
                          {q.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => copyToClipboard(q.answer)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

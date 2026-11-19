import React from 'react';
import {
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Lock,
  GitBranch,
  Gauge,
  CheckCircle,
  FileCode,
  Terminal,
  Sparkles,
  Sliders,
  Leaf,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Incident Doctor & Root-Cause Analysis (RCA)',
      description:
        'Autonomous SRE intelligence parses pod stack traces, identifies code failure vectors (memory leaks, pool exhaustion), and generates verified 1-click Git patches.',
      tags: ['Autonomous SRE', 'AST Diff', '1-Click Git Patch', 'Unique Innovation'],
    },
    {
      icon: Sliders,
      title: 'Predictive Blast Radius & Pre-Flight Risk Score',
      description:
        'Calculates real-time deployment risk scores (0-100) using code churn, test coverage delta, and schema migrations to recommend Canary or Zero-Downtime rollouts.',
      tags: ['Risk Modeling', 'Canary Intelligence', 'Blast Radius Containment'],
    },
    {
      icon: Leaf,
      title: 'EcoDeploy: Green Software Carbon Accounting',
      description:
        'Calculates build carbon emissions (g CO2e) across cloud grids (AWS Stockholm hydro vs Virginia coal) to minimize environmental computing impact.',
      tags: ['Green CI/CD', 'ISO 14064', 'ESG Carbon Compliance'],
    },
    {
      icon: GitBranch,
      title: 'Automated CI/CD Delivery Pipeline',
      description:
        'Continuous integration workflows executing linting, unit testing, and automated deployment triggering with zero-downtime container updates.',
      tags: ['GitHub Actions', 'Docker Compose', 'Automated Verification'],
    },
    {
      icon: Layers,
      title: 'Multi-Tenant Architecture',
      description:
        'Isolated tenant boundary isolation with custom slugs (e.g. /acme-corp) ensuring all usage records, memberships, and pipeline events remain strictly scoped.',
      tags: ['Tenant Isolation', 'Slug Routing', 'Mongoose Indexes'],
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control (RBAC)',
      description:
        'Owner, Admin, and Member hierarchies with server-enforced permissions on endpoints. Member invitations include cryptographically signed tokens.',
      tags: ['Owner Privileges', 'Token Invites', 'Backend Guards'],
    },
    {
      icon: Gauge,
      title: 'Quota Engine & HTTP 429 Throttling',
      description:
        'Backend middleware dynamically tracks monthly deployment limits, build minutes, and team seats. Excess requests are safely rejected with HTTP 429 Too Many Requests.',
      tags: ['Rate Limiting', 'Tier Quotas', 'HTTP 429 Standards'],
    },
    {
      icon: Activity,
      title: 'Liveness & Readiness Health Probes',
      description:
        'Standardized Kubernetes-ready health endpoints (/healthz and /readyz) testing memory usage, process uptime, and live MongoDB replica connections.',
      tags: ['Liveness (/healthz)', 'Readiness (/readyz)', 'Docker Probes'],
    },
    {
      icon: Terminal,
      title: 'Pino Structured Request Logging',
      description:
        'High-performance JSON logging with correlation IDs and pretty-print formatting for development. Automatically strips sensitive credentials.',
      tags: ['Pino Logger', 'Traceability', 'Security Redaction'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Engineered for Enterprise CI/CD & Academic Evaluation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          DeployFlow demonstrates professional software engineering standards, container readiness, multi-tier subscription controls, and automated testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{f.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                {f.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold mb-1">Verify Live Liveness & Readiness Endpoints</h3>
          <p className="text-xs text-slate-400">
            Open the real-time HTTP endpoints running on the Express backend to inspect process health.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/healthz"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors"
          >
            Open /healthz
          </a>
          <a
            href="/readyz"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
          >
            Open /readyz
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  X,
  Code2,
  Sparkles,
  GitBranch,
  Shield,
  Layers,
} from 'lucide-react';

interface CliModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug?: string;
  projectName?: string;
}

export const CliModal: React.FC<CliModalProps> = ({
  isOpen,
  onClose,
  projectSlug = 'my-project',
  projectName = 'My Project',
}) => {
  const [activeTab, setActiveTab] = useState<'cli' | 'github' | 'curl'>('cli');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const cliCommands = `# 1. Install DeployFlow CLI globally
npm install -g deployflow

# 2. Authenticate CLI session
deployflow login --token dfl_tok_live_9a8f2c

# 3. Deploy current directory live
deployflow deploy --project ${projectSlug} --prod`;

  const githubActionsYaml = `name: DeployFlow CI/CD Pipeline
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to DeployFlow Global Edge
        uses: deployflow/deploy-action@v2
        with:
          api-token: \${{ secrets.DEPLOYFLOW_API_TOKEN }}
          project-slug: "${projectSlug}"
          production: true`;

  const curlSnippet = `curl -X POST https://api.deployflow.io/api/projects/${projectSlug}/deploy \\
  -H "Authorization: Bearer dfl_tok_live_9a8f2c" \\
  -H "Content-Type: application/json" \\
  -d '{"sourceType": "template", "templateId": "portfolio", "commitMsg": "Deploy from CI"}'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                DeployFlow Developer CLI &amp; CI/CD
              </h2>
              <p className="text-xs text-slate-500">
                Deploy <strong>{projectName}</strong> directly from your terminal or automated pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cli')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'cli'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DeployFlow CLI
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'github'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GitHub Actions CI/CD
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'curl'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            cURL / REST API
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'cli' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Run this command in any directory to authenticate and deploy directly to your production cluster:
              </p>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400">
                <button
                  onClick={() => copy('cli', cliCommands)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-sans font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {copiedKey === 'cli' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'cli' ? 'Copied' : 'Copy'}
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap">{cliCommands}</pre>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Commit this workflow file to <code className="text-emerald-700 font-bold">.github/workflows/deployflow.yml</code> for automated git-push builds:
              </p>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-sky-300">
                <button
                  onClick={() => copy('gh', githubActionsYaml)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-sans font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {copiedKey === 'gh' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'gh' ? 'Copied' : 'Copy'}
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap">{githubActionsYaml}</pre>
              </div>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Trigger programmatically from bash, Jenkins, GitLab CI, or Docker webhook:
              </p>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-amber-300">
                <button
                  onClick={() => copy('curl', curlSnippet)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-sans font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {copiedKey === 'curl' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'curl' ? 'Copied' : 'Copy'}
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap">{curlSnippet}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Target Cluster: <strong>Global Anycast Edge</strong></span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

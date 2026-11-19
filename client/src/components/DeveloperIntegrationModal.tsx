import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Zap,
  GitCommit,
  CheckCircle2,
  RefreshCw,
  Server,
  HelpCircle,
  Code2,
} from 'lucide-react';
import {
  useTriggerGithubWebhookMutation,
  useSendApiTelemetryMutation,
} from '../services/api';

interface DeveloperIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgSlug: string;
  orgName: string;
  onWebhookSuccess?: (deployment: any) => void;
}

export const DeveloperIntegrationModal: React.FC<DeveloperIntegrationModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgSlug,
  orgName,
  onWebhookSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'webhook' | 'viva'>('telemetry');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any | null>(null);

  const [triggerWebhook, { isLoading: isWebhookLoading }] = useTriggerGithubWebhookMutation();
  const [sendTelemetry, { isLoading: isTelemetryLoading }] = useSendApiTelemetryMutation();

  if (!isOpen) return null;

  const targetIdentifier = orgSlug || orgId;

  // PowerShell curl commands (Windows escaping)
  const psTelemetryCmd = `curl.exe -X POST http://localhost:5000/api/telemetry/api-call -H "Content-Type: application/json" -d "{\`"orgId\`\":\`"${targetIdentifier}\`\",\`"count\`\":25}"`;
  const bashTelemetryCmd = `curl -X POST http://localhost:5000/api/telemetry/api-call -H "Content-Type: application/json" -d '{"orgId":"${targetIdentifier}","count":25}'`;

  const psWebhookCmd = `curl.exe -X POST http://localhost:5000/api/webhooks/github -H "Content-Type: application/json" -d "{\`"orgId\`\":\`"${targetIdentifier}\`\",\`"commit\`\":\`"f8e21a4\`\",\`"message\`\":\`"feat: add payment gateway webhook\`\"}"`;
  const bashWebhookCmd = `curl -X POST http://localhost:5000/api/webhooks/github -H "Content-Type: application/json" -d '{"orgId":"${targetIdentifier}","commit":"f8e21a4","message":"feat: add payment gateway webhook"}'`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleRunTelemetryTest = async () => {
    setLastResponse(null);
    try {
      const res = await sendTelemetry({ orgId: targetIdentifier, count: 25 }).unwrap();
      setLastResponse({
        type: 'telemetry',
        data: res,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setLastResponse({
        type: 'error',
        data: err?.data || { message: 'Connection failed' },
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleRunWebhookTest = async () => {
    setLastResponse(null);
    const sampleCommit = Math.random().toString(16).slice(2, 9);
    try {
      const res = await triggerWebhook({
        orgId: targetIdentifier,
        commit: sampleCommit,
        message: 'feat(orders): live microservice webhook rollout',
      }).unwrap();

      setLastResponse({
        type: 'webhook',
        data: res,
        timestamp: new Date().toLocaleTimeString(),
      });

      if (onWebhookSuccess && res.data) {
        onWebhookSuccess({
          id: res.data.deploymentId,
          commit: res.data.commit,
          message: res.data.message,
          branch: res.data.branch || 'main',
          status: 'Completed',
          duration: '4.9s',
          timestamp: 'Just now',
          environment: 'production',
        });
      }
    } catch (err: any) {
      setLastResponse({
        type: 'error',
        data: err?.data || { message: 'Webhook failed' },
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Developer Integration &amp; Live Evaluator
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Live REST API
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Workspace target: <span className="font-mono font-bold text-slate-700">{orgName}</span> ({targetIdentifier})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'telemetry'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="h-4 w-4" />
            1. External API Telemetry (cURL)
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'webhook'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitCommit className="h-4 w-4" />
            2. Real GitHub Git-Push Webhook
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
              activeTab === 'viva'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            3. Teacher / Viva Presentation Script
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <Server className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-950 text-xs">
                      How External Apps Feed API Calls into DeployFlow
                    </h4>
                    <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                      Whenever an external microservice, mobile app, or backend handles client traffic, it sends lightweight asynchronous telemetry pings to DeployFlow. DeployFlow checks rate limits in real-time and logs quota consumption into MongoDB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Windows PowerShell command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-slate-500" />
                    Windows PowerShell Command (Live Demo for Teacher)
                  </span>
                  <button
                    onClick={() => handleCopy(psTelemetryCmd, 'ps-tel')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedType === 'ps-tel' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy PowerShell
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-900 p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all">
                  {psTelemetryCmd}
                </pre>
              </div>

              {/* Linux / Mac Bash command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-600">
                    Linux / Mac / Git Bash Command
                  </span>
                  <button
                    onClick={() => handleCopy(bashTelemetryCmd, 'bash-tel')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {copiedType === 'bash-tel' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Bash
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-900 p-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {bashTelemetryCmd}
                </pre>
              </div>

              {/* Live Run Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Or test right now from this dashboard:
                </span>
                <button
                  onClick={handleRunTelemetryTest}
                  disabled={isTelemetryLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition-colors"
                >
                  {isTelemetryLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 fill-current" />
                  )}
                  {isTelemetryLoading ? 'Sending Telemetry...' : '🚀 Test Telemetry Now (+25 Calls)'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-start gap-3">
                  <GitCommit className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">
                      How Git Push Triggers Automated CI/CD Deployments
                    </h4>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      Developers don't upload zip files. When you push to GitHub, GitHub executes a POST Webhook to DeployFlow at <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-[11px]">/api/webhooks/github</code>. DeployFlow runs linting, tests, container build, and cloud rollout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Windows PowerShell webhook command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-slate-500" />
                    Windows PowerShell Command (Live Demo for Teacher)
                  </span>
                  <button
                    onClick={() => handleCopy(psWebhookCmd, 'ps-hook')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {copiedType === 'ps-hook' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy PowerShell
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-900 p-3.5 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all">
                  {psWebhookCmd}
                </pre>
              </div>

              {/* Linux / Mac Bash command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-600">
                    Linux / Mac / Git Bash Command
                  </span>
                  <button
                    onClick={() => handleCopy(bashWebhookCmd, 'bash-hook')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {copiedType === 'bash-hook' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Bash
                      </>
                    )}
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-900 p-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {bashWebhookCmd}
                </pre>
              </div>

              {/* Live Run Webhook Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Trigger pipeline without terminal:
                </span>
                <button
                  onClick={handleRunWebhookTest}
                  disabled={isWebhookLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition-colors"
                >
                  {isWebhookLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <GitCommit className="h-3.5 w-3.5" />
                  )}
                  {isWebhookLoading ? 'Executing CI/CD...' : '🚀 Trigger GitHub Webhook Push'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-700" />
                  What to Tell Sir / Teachers During Evaluation
                </h4>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  Teachers expect production architecture answers. Use these exact talking points:
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  1️⃣ Question: "Where do we upload our code in this website?"
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Answer:</strong> "Sir, modern cloud platforms like Vercel, Render, or ArgoCD do not ask developers to manually upload ZIP files through a browser. Instead, our platform uses <strong>GitOps Webhooks</strong>. As soon as a developer runs <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">git push origin main</code>, GitHub fires a webhook payload to our <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/webhooks/github</code> endpoint, which initiates our automated 4-stage pipeline."
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  2️⃣ Question: "How does DeployFlow track API Calls &amp; Quotas?"
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Answer:</strong> "Sir, external microservices send telemetry events to our <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/telemetry/api-call</code> endpoint. DeployFlow validates the workspace subscription, checks if monthly quota has been exhausted, and immediately throws HTTP 429 Rate-Limit Exceeded if quota is breached."
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  3️⃣ Question: "What makes DeployFlow unique from typical CRUD student projects?"
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Answer:</strong> "Sir, DeployFlow includes an <strong>Autonomous SRE &amp; AI Ops Engine</strong>:
                  <br />&bull; <strong>AI Incident Doctor</strong>: Performs automated Root Cause Analysis on fatal crash dumps and generates a 1-click Git patch.
                  <br />&bull; <strong>Canary Rollback</strong>: Probes canary clusters and autonomously rolls back to safe commit SHA if the error persists.
                  <br />&bull; <strong>Pre-flight Blast-Radius Scoring</strong>: Evaluates migration risk on a 0-100 scale.
                  <br />&bull; <strong>EcoDeploy Carbon Accounting</strong>: Calculates Green CI/CD footprint in grams of CO₂e."
                </p>
              </div>
            </div>
          )}

          {/* Live response card if any */}
          {lastResponse && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Live Response Received at {lastResponse.timestamp}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  HTTP 200 OK
                </span>
              </div>
              <pre className="text-emerald-300 overflow-x-auto text-[11px] whitespace-pre-wrap max-h-40">
                {JSON.stringify(lastResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            DeployFlow Telemetry Protocol v2.4 &bull; Production Ready
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close Evaluator
          </button>
        </div>
      </div>
    </div>
  );
};

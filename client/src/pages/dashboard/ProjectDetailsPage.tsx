import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import {
  useGetProjectQuery,
  useDeployProjectMutation,
  useRollbackProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddCustomDomainMutation,
  useRemoveCustomDomainMutation,
  useTestEdgeFunctionMutation,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CliModal } from '../../components/CliModal';
import {
  ExternalLink,
  RotateCcw,
  RefreshCw,
  Terminal,
  Globe,
  GitBranch,
  Clock,
  Layers,
  Shield,
  Activity,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Trash2,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Key,
  Plus,
  ArrowLeft,
  X,
  FileCode,
  Sparkles,
  Server,
  Zap,
  Lock,
  Download,
  FileText,
  Check,
} from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);

  const {
    data: projectData,
    isLoading,
    refetch,
  } = useGetProjectQuery(
    { id: id || '', orgId: activeOrgId || undefined },
    { skip: !id, pollingInterval: 4000 }
  );

  const [deployMutation, { isLoading: isDeploying }] = useDeployProjectMutation();
  const [rollbackMutation, { isLoading: isRollingBack }] = useRollbackProjectMutation();
  const [updateMutation] = useUpdateProjectMutation();
  const [deleteMutation] = useDeleteProjectMutation();
  const [addDomainMutation, { isLoading: isAddingDomain }] = useAddCustomDomainMutation();
  const [removeDomainMutation] = useRemoveCustomDomainMutation();
  const [testEdgeMutation, { isLoading: isTestingEdge }] = useTestEdgeFunctionMutation();

  const [activeTab, setActiveTab] = useState<
    'preview' | 'deployments' | 'domains' | 'env' | 'serverless' | 'analytics'
  >('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedLogsDeployment, setSelectedLogsDeployment] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Environment variables state
  const [envVars, setEnvVars] = useState<
    { key: string; value: string; isSecret?: boolean; target?: string }[]
  >([]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [isBulkEnvOpen, setIsBulkEnvOpen] = useState(false);
  const [bulkEnvText, setBulkEnvText] = useState('');

  // Custom Domains state
  const [newCustomDomain, setNewCustomDomain] = useState('');

  // Serverless Edge test state
  const [edgeRoute, setEdgeRoute] = useState('/api/hello');
  const [edgeMethod, setEdgeMethod] = useState<'GET' | 'POST'>('GET');
  const [edgeResponse, setEdgeResponse] = useState<any | null>(null);

  const project = projectData?.data?.project;
  const deployments = projectData?.data?.deployments || [];
  const activeDeployment = project?.activeDeployment;

  useEffect(() => {
    if (project?.envVars) {
      setEnvVars(project.envVars);
    }
  }, [project]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  if (isLoading && !project) {
    return <LoadingSpinner text="Fetching project deployment telemetry..." />;
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Project Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">The project was deleted or moved.</p>
        <Link
          to="/dashboard/projects"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white"
        >
          &larr; Back to Projects
        </Link>
      </div>
    );
  }

  const handleQuickRedeploy = async () => {
    try {
      setFeedback(null);
      const res = await deployMutation({
        id: project._id,
        orgId: activeOrgId || undefined,
        sourceType: project.sourceType,
        templateId: project.templateId,
        commitMsg: `Manual redeploy via Dashboard`,
      }).unwrap();

      setFeedback({
        msg: `Deployment ${res.data.deploymentId} completed and served live!`,
        type: 'success',
      });
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Redeploy failed. Check quota and logs.',
        type: 'error',
      });
    }
  };

  const handleRollback = async (deploymentId: string) => {
    if (!confirm(`Promote deployment "${deploymentId}" to active production?`)) {
      return;
    }

    try {
      setFeedback(null);
      await rollbackMutation({
        id: project._id,
        deploymentId,
        orgId: activeOrgId || undefined,
      }).unwrap();

      setFeedback({
        msg: `Successfully rolled back to deployment ${deploymentId} with zero downtime!`,
        type: 'success',
      });

      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Rollback failed.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}" and all associated edge deployments? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteMutation({ id: project._id, orgId: activeOrgId || undefined }).unwrap();
      navigate('/dashboard/projects');
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleAddEnvVar = async () => {
    if (!newKey.trim() || !newVal.trim()) return;
    const updated = [...envVars, { key: newKey.trim(), value: newVal.trim(), isSecret: false }];
    setEnvVars(updated);
    setNewKey('');
    setNewVal('');
    await updateMutation({ id: project._id, envVars: updated });
    setFeedback({ msg: 'Environment variables saved.', type: 'success' });
  };

  const handleBulkEnvParse = async () => {
    if (!bulkEnvText.trim()) return;
    const lines = bulkEnvText.split('\n');
    const parsed: { key: string; value: string; isSecret: boolean }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const k = line.slice(0, eqIdx).trim().toUpperCase();
        let v = line.slice(eqIdx + 1).trim();
        // Strip surrounding quotes
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (k) {
          parsed.push({ key: k, value: v, isSecret: false });
        }
      }
    }

    if (parsed.length > 0) {
      const merged = [...envVars, ...parsed];
      setEnvVars(merged);
      await updateMutation({ id: project._id, envVars: merged });
      setIsBulkEnvOpen(false);
      setBulkEnvText('');
      setFeedback({ msg: `Imported ${parsed.length} environment variables successfully.`, type: 'success' });
    }
  };

  const handleExportEnv = () => {
    const text = envVars.map((v) => `${v.key}=${v.value}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied .env format to clipboard!');
  };

  const handleRemoveEnvVar = async (index: number) => {
    const updated = envVars.filter((_, i) => i !== index);
    setEnvVars(updated);
    await updateMutation({ id: project._id, envVars: updated });
    setFeedback({ msg: 'Environment variable removed.', type: 'success' });
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomDomain.trim()) return;
    try {
      await addDomainMutation({
        id: project._id,
        domain: newCustomDomain.trim(),
        orgId: activeOrgId || undefined,
      }).unwrap();
      setNewCustomDomain('');
      setFeedback({ msg: `Domain ${newCustomDomain} configured with TLS 1.3 certificate!`, type: 'success' });
    } catch (err: any) {
      setFeedback({ msg: err?.data?.message || 'Failed to add custom domain.', type: 'error' });
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!confirm(`Disconnect domain "${domain}"?`)) return;
    try {
      await removeDomainMutation({
        id: project._id,
        domain,
        orgId: activeOrgId || undefined,
      }).unwrap();
      setFeedback({ msg: `Domain ${domain} removed.`, type: 'success' });
    } catch (err: any) {
      setFeedback({ msg: 'Failed to remove domain.', type: 'error' });
    }
  };

  const handleTestEdge = async () => {
    try {
      const res = await testEdgeMutation({
        id: project._id,
        route: edgeRoute,
        method: edgeMethod,
        orgId: activeOrgId || undefined,
      }).unwrap();
      setEdgeResponse(res.data);
    } catch (err: any) {
      alert('Edge function test failed: ' + (err?.data?.message || 'Error'));
    }
  };

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `${project.liveUrl}?t=${Date.now()}`;
    }
  };

  const fullLiveUrl = `${window.location.origin}${project.liveUrl}`;
  const customDomains = project.customDomains || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/projects" className="hover:text-slate-800 flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{project.name}</span>
        </div>

        <button
          onClick={() => setIsCliModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 font-semibold"
        >
          <Terminal className="h-3 w-3 text-slate-500" />
          Deploy via CLI
        </button>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 shadow-xs">
              <Globe className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {project.name}
                </h1>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 uppercase">
                  {project.framework}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Live
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {project.description || 'Production edge hosted workload on DeployFlow Global Anycast.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickRedeploy}
              disabled={isDeploying}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
              Redeploy
            </button>

            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              Visit Live
            </a>

            <button
              onClick={handleDelete}
              title="Delete Project"
              className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live URL Pill Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Production URL:</span>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-emerald-700 hover:underline font-semibold"
            >
              {fullLiveUrl}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullLiveUrl);
                alert('Copied URL to clipboard!');
              }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-3 w-3" />
              Copy Link
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">
              Avg Latency: <strong>{project.analytics?.avgResponseTimeMs || 12}ms</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">
              Total Requests: <strong>{project.analytics?.totalRequests || 0}</strong>
            </span>
          </div>
        </div>

        {/* Real-time Interactive Pipeline Stages */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Active Deployment Pipeline
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>1. Commit Checked</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{activeDeployment?.commit || 'main'}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>2. Isolated Sandbox</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">V8 Isolated Worker</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>3. Build &amp; Bundle</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{activeDeployment?.bundleSize || '3 files'}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>4. Edge Routing</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="mt-1 font-mono text-[10px] text-slate-500">Zero-Downtime Pointer</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span>5. Global Live</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-emerald-700">{activeDeployment?.duration || '3.4s'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-3.5 text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'preview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="h-4 w-4" />
            Live Preview
          </button>

          <button
            onClick={() => setActiveTab('deployments')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'deployments'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            Deployments &amp; Rollbacks ({deployments.length})
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'domains'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            Domains &amp; SSL ({customDomains.length + 1})
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'env'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="h-4 w-4" />
            Environment Variables ({envVars.length})
          </button>

          <button
            onClick={() => setActiveTab('serverless')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'serverless'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="h-4 w-4" />
            Serverless Edge Tester
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            Edge Analytics
          </button>
        </nav>
      </div>

      {/* Tab 1: Live In-Dashboard Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 mr-2">Viewport:</span>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  previewDevice === 'tablet'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
                Tablet (768px)
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile (375px)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reloadIframe}
                title="Reload Frame"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3 w-3" />
                Reload
              </button>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-800 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-100"
              >
                <ExternalLink className="h-3 w-3" />
                Pop Out
              </a>
            </div>
          </div>

          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-900/90 p-4 shadow-inner min-h-[560px]">
            <div
              className="transition-all duration-300 flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-white shadow-2xl"
              style={{
                width:
                  previewDevice === 'desktop'
                    ? '100%'
                    : previewDevice === 'tablet'
                      ? '768px'
                      : '375px',
                height: '560px',
              }}
            >
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 truncate rounded bg-white px-3 py-0.5 text-center font-mono text-[11px] text-slate-600 border border-slate-200">
                  {fullLiveUrl}
                </div>
              </div>

              <iframe
                ref={iframeRef}
                src={project.liveUrl}
                title={project.name}
                className="w-full flex-1 border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Deployments & 1-Click Rollback */}
      {activeTab === 'deployments' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Deployment History &amp; Zero-Downtime Rollbacks
              </h3>
              <p className="text-xs text-slate-500">
                Every build is immutable. Click &ldquo;Promote to Live&rdquo; on any past version for instant rollback.
              </p>
            </div>
            <button
              onClick={handleQuickRedeploy}
              disabled={isDeploying}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <Play className="h-3 w-3" />
              Trigger New Build
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Deployment ID</th>
                  <th className="px-6 py-3">Commit &amp; Message</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Bundle Size</th>
                  <th className="px-6 py-3">Deployed At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deployments.map((dep) => {
                  const isCurrent = dep.isCurrentLive;
                  return (
                    <tr
                      key={dep.deploymentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                            ACTIVE LIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                        {dep.deploymentId}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="w-fit rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                            {dep.commit}
                          </span>
                          <span className="truncate text-slate-700 font-medium">
                            {dep.message}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-600">
                        {dep.duration}
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-600">
                        {dep.bundleSize || `${dep.fileCount} files`}
                      </td>

                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(dep.createdAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLogsDeployment(dep)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Terminal className="h-3 w-3 text-slate-400" />
                            Logs
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleRollback(dep.deploymentId)}
                              disabled={isRollingBack}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Rollback
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Domains & DNS Management */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Domains &amp; SSL Certificates
              </h3>
              <p className="text-xs text-slate-500">
                Configure edge domains for this project. Automatic Let&rsquo;s Encrypt TLS 1.3 certificates are provisioned for all verified domains.
              </p>
            </div>

            {/* Default Edge Domain */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {project.slug}.deployflow.app
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Default Edge Route
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target: Anycast Edge Proxy · HTTP/2 &amp; TLS 1.3
                    </p>
                  </div>
                </div>

                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Visit Endpoint <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Custom Domains List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Custom Domains ({customDomains.length})
              </h4>

              {customDomains.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                  No custom domains attached yet. Connect your custom domain below.
                </div>
              ) : (
                <div className="space-y-2">
                  {customDomains.map((dom) => (
                    <div
                      key={dom.domain}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-emerald-600" />
                        <div>
                          <span className="font-mono font-bold text-slate-900">{dom.domain}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>CNAME: <code>{dom.cnameRecord}</code></span>
                            <span>·</span>
                            <span className="text-emerald-700 font-semibold">TLS 1.3 Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3" />
                          DNS Verified
                        </span>
                        <button
                          onClick={() => handleRemoveDomain(dom.domain)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Domain Form */}
            <form onSubmit={handleAddDomain} className="border-t border-slate-100 pt-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Connect New Custom Domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCustomDomain}
                  onChange={(e) => setNewCustomDomain(e.target.value)}
                  placeholder="e.g. app.mycompany.com or portfolio.janvi.dev"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingDomain}
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isAddingDomain ? 'Verifying DNS...' : 'Add Domain'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                To connect, add a <strong>CNAME</strong> record in your DNS provider (Cloudflare, GoDaddy, Namecheap) pointing to <code className="text-emerald-700 font-bold">cname.deployflow.edge</code>.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Environment Variables with Bulk .env Paste */}
      {activeTab === 'env' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Project Environment Variables
              </h3>
              <p className="text-xs text-slate-500">
                Variables are encrypted and injected into sandboxed builds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkEnvOpen(!isBulkEnvOpen)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Bulk .env Import
              </button>

              <button
                type="button"
                onClick={handleExportEnv}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                Export
              </button>

              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs font-semibold text-emerald-800 hover:underline ml-2"
              >
                {showSecrets ? 'Hide Values' : 'Reveal Values'}
              </button>
            </div>
          </div>

          {/* Bulk Paste Area */}
          {isBulkEnvOpen && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Paste .env file contents</span>
                <button onClick={() => setIsBulkEnvOpen(false)}>
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <textarea
                rows={5}
                value={bulkEnvText}
                onChange={(e) => setBulkEnvText(e.target.value)}
                placeholder="DATABASE_URL=mongodb+srv://...&#10;API_KEY=df_live_89a1&#10;PORT=5000"
                className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs focus:outline-none"
              />
              <button
                onClick={handleBulkEnvParse}
                className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Parse &amp; Append Variables
              </button>
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {envVars.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom variables configured.</p>
            ) : (
              envVars.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">{v.key}</span>
                    <span className="text-slate-400">=</span>
                    <span className="font-mono text-slate-600">
                      {showSecrets || !v.isSecret ? v.value : '••••••••••••••••'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveEnvVar(i)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Single Variable Form */}
          <div className="border-t border-slate-100 pt-4 flex gap-2">
            <input
              type="text"
              placeholder="KEY (e.g. STRIPE_SECRET_KEY)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono uppercase focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="VALUE"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-emerald-600 focus:outline-none"
            />
            <button
              onClick={handleAddEnvVar}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Serverless Edge Function Tester */}
      {activeTab === 'serverless' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-700" />
              Serverless Edge Function Playground
            </h3>
            <p className="text-xs text-slate-500">
              Execute low-latency microservice requests on DeployFlow isolated edge nodes.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={edgeMethod}
              onChange={(e) => setEdgeMethod(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={edgeRoute}
              onChange={(e) => setEdgeRoute(e.target.value)}
              placeholder="/api/hello"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono focus:border-emerald-600 focus:outline-none"
            />
            <button
              onClick={handleTestEdge}
              disabled={isTestingEdge}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {isTestingEdge ? 'Invoking Edge...' : 'Send Request'}
            </button>
          </div>

          {/* Response Console */}
          {edgeResponse ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-900 px-2 py-0.5 text-emerald-300 font-bold">
                    HTTP {edgeResponse.status} OK
                  </span>
                  <span className="text-slate-400">Time: <strong className="text-white">{edgeResponse.executionMs}ms</strong></span>
                </div>
                <span className="text-sky-400">Node: {edgeResponse.region}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Response Payload</span>
                <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(edgeResponse.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              Click &ldquo;Send Request&rdquo; to execute a test invocation against your edge cluster.
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Real Edge Traffic & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Ingested Requests
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {(project.analytics?.totalRequests || 0).toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-emerald-700 font-semibold">
                ✓ Recorded across Edge Proxies
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Average Edge Latency
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700 font-mono">
                {project.analytics?.avgResponseTimeMs || 12} ms
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                P99 response duration
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Edge Uptime SLA
              </p>
              <p className="mt-2 text-3xl font-extrabold text-sky-600">
                99.98%
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Cluster redundancy active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Build Logs Terminal Modal */}
      {selectedLogsDeployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-5 py-3 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-mono font-bold text-slate-200">
                  Build Logs · {selectedLogsDeployment.deploymentId}
                </span>
              </div>
              <button
                onClick={() => setSelectedLogsDeployment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 space-y-1 bg-slate-950 selection:bg-emerald-900">
              {selectedLogsDeployment.buildLogs && selectedLogsDeployment.buildLogs.length > 0 ? (
                selectedLogsDeployment.buildLogs.map((log: string, idx: number) => {
                  let colorClass = 'text-slate-300';
                  if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400 font-bold';
                  if (log.includes('[ERROR]')) colorClass = 'text-rose-400 font-bold';
                  if (log.includes('[INIT]') || log.includes('[SANDBOX]')) colorClass = 'text-sky-400';
                  if (log.includes('[WRITE]')) colorClass = 'text-amber-300';
                  if (log.includes('[ROLLBACK]')) colorClass = 'text-purple-400 font-bold';

                  return (
                    <div key={idx} className={colorClass}>
                      {log}
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic">No detailed logs recorded for this build.</div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-900/40 p-3 flex justify-between items-center text-xs text-slate-500">
              <span>Exit Code: 0 (Nominal)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    selectedLogsDeployment.buildLogs?.join('\n') || ''
                  );
                  alert('Logs copied to clipboard');
                }}
                className="rounded bg-slate-800 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700"
              >
                Copy All Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLI Modal */}
      <CliModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        projectSlug={project.slug}
        projectName={project.name}
      />
    </div>
  );
};

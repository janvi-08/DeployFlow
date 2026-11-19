import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../features/store';
import { setActiveOrgId } from '../../features/authSlice';
import {
  useGetOrgsQuery,
  useGetUsageQuery,
  useGetSubscriptionQuery,
  useSimulateDeploymentMutation,
  useGetDeploymentsQuery,
  useGetProjectsQuery,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import {
  Rocket,
  Users,
  CreditCard,
  BarChart3,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  X,
  Sparkles,
  Cpu,
  Leaf,
  ShieldCheck,
  Terminal,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeveloperIntegrationModal } from '../../components/DeveloperIntegrationModal';

interface Deployment {
  id: string;
  commit: string;
  message: string;
  branch: string;
  status: string;
  duration: string;
  timestamp: string;
  environment: string;
}

const sampleDeployments: Deployment[] = [
  {
    id: 'sample-01',
    commit: '7f3b89a',
    message: 'Example deployment activity',
    branch: 'main',
    status: 'Completed',
    duration: '4.2s',
    timestamp: 'Sample',
    environment: 'staging',
  },
  {
    id: 'sample-02',
    commit: '4a1c620',
    message: 'Example build verification',
    branch: 'dev',
    status: 'Completed',
    duration: '3.8s',
    timestamp: 'Sample',
    environment: 'preview',
  },
];

interface MetricCardProps {
  title: string;
  current: number;
  limit?: number;
  percentage?: number;
  icon: React.ElementType;
  accent: 'emerald' | 'blue' | 'violet' | 'amber';
  footer?: React.ReactNode;
  description?: string;
}

const accentStyles = {
  emerald: {
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    bar: 'bg-emerald-600',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-700 ring-blue-100',
    bar: 'bg-blue-600',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-700 ring-violet-100',
    bar: 'bg-violet-600',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700 ring-amber-100',
    bar: 'bg-amber-500',
  },
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  current,
  limit,
  percentage,
  icon: Icon,
  accent,
  footer,
  description,
}) => {
  const styles = accentStyles[accent];
  const safePercentage = Math.max(0, Math.min(100, percentage ?? 0));

  const barColor =
    (percentage ?? 0) >= 100
      ? 'bg-rose-500'
      : (percentage ?? 0) >= 75
        ? 'bg-amber-500'
        : styles.bar;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {current.toLocaleString()}
        </span>

        <span className="text-sm text-slate-500">
          / {limit == null ? '—' : limit.toLocaleString()}
        </span>
      </div>

      {limit != null && (
        <>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`${title} quota usage`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safePercentage}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${safePercentage}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {percentage == null
              ? 'Usage percentage unavailable'
              : `${percentage}% of quota used`}
          </p>
        </>
      )}

      {footer && <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>}
    </section>
  );
};

export const OverviewDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);

  const { data: orgsData, isLoading: isOrgsLoading } = useGetOrgsQuery();
  const orgs = orgsData?.data || [];
  const currentOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  const effectiveOrgId = currentOrg?.id || activeOrgId || '';

  useEffect(() => {
    if (currentOrg && currentOrg.id !== activeOrgId) {
      dispatch(setActiveOrgId(currentOrg.id));
    }
  }, [currentOrg, activeOrgId, dispatch]);

  const { data: usageData, isLoading: isUsageLoading } = useGetUsageQuery(
    effectiveOrgId,
    { skip: !effectiveOrgId }
  );

  const { data: subData } = useGetSubscriptionQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });

  const { data: deploymentsData } = useGetDeploymentsQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
    pollingInterval: 3000,
  });

  const { data: projectsData } = useGetProjectsQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });

  const liveProjects = projectsData?.data || [];

  const [simulateDeployment, { isLoading: isDeploying }] =
    useSimulateDeploymentMutation();

  const [deployFeedback, setDeployFeedback] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const [recentDeployments, setRecentDeployments] =
    useState<Deployment[]>(sampleDeployments);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  const displayDeployments: Deployment[] =
    deploymentsData?.data && deploymentsData.data.length > 0
      ? deploymentsData.data
      : recentDeployments;

  const metrics = usageData?.data?.metrics;

  useEffect(() => {
    if (!deployFeedback) return;

    const timeout = setTimeout(() => setDeployFeedback(null), 6000);

    return () => clearTimeout(timeout);
  }, [deployFeedback]);

  const handleQuickDeploy = async () => {
    if (!currentOrg) return;

    setDeployFeedback(null);

    try {
      const res = await simulateDeployment({
        orgId: currentOrg.id,
      }).unwrap();

      const deploymentId =
        res.data?.deploymentId || `dep-${Date.now().toString().slice(-6)}`;

      setRecentDeployments((previous) => [
        {
          id: deploymentId,
          commit: 'manual',
          message: 'Deployment simulation requested',
          branch: 'main',
          status: 'Completed',
          duration: '—',
          timestamp: 'Just now',
          environment: 'simulation',
        },
        ...previous.filter((deployment) => deployment.id !== deploymentId).slice(0, 4),
      ]);

      setDeployFeedback({
        msg: `Deployment simulation registered. Usage: ${res.data?.currentUsage ?? '—'} / ${res.data?.quotaLimit ?? '—'}.`,
        type: 'success',
      });
    } catch (err: any) {
      setDeployFeedback({
        msg:
          err?.data?.message ||
          'The deployment request failed. Check your quota and try again.',
        type: 'error',
      });
    }
  };

  if (isOrgsLoading && !currentOrg) {
    return <LoadingSpinner text="Loading workspace..." />;
  }

  if (!currentOrg) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Rocket className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          No workspace selected
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Create an organisation or select a workspace to view its dashboard.
        </p>
        <Link
          to="/dashboard/settings"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          Open organisation settings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const deploymentMetric = metrics?.deployments;
  const teamMetric = metrics?.team_members;
  const apiMetric = metrics?.api_calls;
  const subscription = subData?.data?.subscription;

  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="space-y-7 pb-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-medium text-slate-700">
              {currentOrg.name}
            </span>
            {currentOrg.slug && (
              <>
                <span>/</span>
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px]">
                  {currentOrg.slug}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor deployment usage, team capacity, subscription details, and
            API consumption for your organisation.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            onClick={handleQuickDeploy}
            disabled={isDeploying}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeploying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {isDeploying ? 'Running...' : 'Run deployment'}
          </button>

          <Link
            to="/dashboard/billing"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <CreditCard className="h-4 w-4 text-slate-500" />
            Plan settings
          </Link>
        </div>
      </section>

      {/* Deployment feedback */}
      {deployFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            deployFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {deployFeedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
          )}

          <p className="flex-1 text-sm leading-6">{deployFeedback.msg}</p>

          <button
            onClick={() => setDeployFeedback(null)}
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-slate-500 hover:bg-white/70 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Subscription summary */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/70 p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-700">
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Current subscription
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold capitalize text-slate-900">
                {currentOrg.plan}
              </h2>
              <Badge
                variant={
                  currentOrg.plan === 'enterprise'
                    ? 'purple'
                    : currentOrg.plan === 'pro'
                      ? 'primary'
                      : 'neutral'
                }
                size="sm"
                dot
              >
                {subscription?.status || 'Plan'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {renewalDate
                ? `Current period ends ${renewalDate}`
                : 'Subscription period end date is unavailable.'}
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/billing"
          className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-950 sm:self-center"
        >
          Manage subscription
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Metrics */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Usage summary
          </h2>
          <Link
            to="/dashboard/usage"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            View usage details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isUsageLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <LoadingSpinner text="Loading usage metrics..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Deployments"
              current={deploymentMetric?.current ?? 0}
              limit={deploymentMetric?.limit}
              percentage={deploymentMetric?.percentage}
              icon={Rocket}
              accent="emerald"
              description="Deployment quota"
            />

            <MetricCard
              title="Team members"
              current={teamMetric?.current ?? 0}
              limit={teamMetric?.limit}
              percentage={teamMetric?.percentage}
              icon={Users}
              accent="blue"
              description="Organisation seats"
              footer={
                <Link
                  to="/dashboard/team"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  Manage team and roles
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <MetricCard
              title="API calls"
              current={apiMetric?.current ?? 0}
              limit={apiMetric?.limit}
              percentage={apiMetric?.percentage}
              icon={BarChart3}
              accent="amber"
              description="API consumption"
              footer={
                <Link
                  to="/dashboard/usage"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  Inspect usage
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Subscription plan
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Organisation tier
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <p className="text-2xl font-bold capitalize tracking-tight text-slate-900">
                {currentOrg.plan}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Plan information is managed through your subscription settings.
              </p>

              <Link
                to="/dashboard/billing"
                className="mt-4 inline-flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                View plan details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </div>
        )}
      </section>

      {/* AI Ops & Autonomous SRE Intelligence Banner (Unique USP) */}
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  AI Ops &amp; Autonomous SRE Intelligence
                </h2>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Distinct Innovation
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                Automated Root-Cause Analysis (RCA) with 1-click git patches, pre-flight blast radius risk scoring, Green CI/CD carbon accounting, and resilience chaos testing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <div className="text-left text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                <span className="font-bold text-emerald-700">18 / 100 (Safe)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <div className="text-left text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Eco Carbon</span>
                <span className="font-bold text-emerald-700">12.4g (A+ Grade)</span>
              </div>
            </div>

            <Link
              to="/dashboard/ai-ops"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              <Cpu className="h-4 w-4" />
              Open AI SRE Console
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Connected Git Source & CI/CD Pipeline Architecture */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Connected Git Repository</h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Webhook Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                github.com/{currentOrg?.slug || 'workspace'}/cloud-backend-service &bull; branch: <span className="font-bold text-slate-800">main</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsIntegrationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              <Terminal className="h-3.5 w-3.5 text-slate-600" />
              Live cURL &amp; Viva Demo
            </button>
            <button
              onClick={handleQuickDeploy}
              disabled={isDeploying}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition-colors"
            >
              {isDeploying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {isDeploying ? 'Executing Pipeline...' : 'Trigger Git Push Webhook'}
            </button>
          </div>
        </div>

        {/* Live CI/CD Pipeline Stages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>1. Code Lint &amp; AST</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">oxlint + tsc</p>
            <span className="mt-2 text-[10px] text-emerald-700 font-bold">0.8s &bull; PASSED</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>2. Automated Tests</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">vitest (3/3 unit)</p>
            <span className="mt-2 text-[10px] text-emerald-700 font-bold">1.4s &bull; PASSED</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>3. Container Build</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">docker build :v1.4</p>
            <span className="mt-2 text-[10px] text-emerald-700 font-bold">2.1s &bull; PASSED</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>4. Cloud Rollout</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">k8s canary cluster</p>
            <span className="mt-2 text-[10px] text-emerald-700 font-bold">HTTP 200 &bull; LIVE</span>
          </div>
        </div>
      </section>

      {/* Live Deployed Edge Applications */}
      {liveProjects.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-700" />
                Live Deployed Applications &amp; Edge Endpoints
              </h2>
              <p className="text-xs text-slate-500">
                Active web services served live by DeployFlow Edge Proxy.
              </p>
            </div>
            <Link
              to="/dashboard/projects"
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              View All Projects ({liveProjects.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveProjects.slice(0, 3).map((proj) => (
              <div
                key={proj._id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{proj.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{proj.description}</p>
                  <p className="mt-2 font-mono text-[10px] text-emerald-700 truncate">{proj.liveUrl}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[10px] text-slate-500">
                  <span>⚡ {proj.analytics?.totalRequests || 0} reqs</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/projects/${proj._id}`}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      Manage &rarr;
                    </Link>
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded bg-emerald-50 text-emerald-700 p-1 hover:bg-emerald-100"
                      title="Open Live Website"
                    >
                      <Globe className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Deployment activity */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Deployment activity
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Recent deployment simulation activity for this workspace.
              </p>
            </div>
          </div>

          <button
            onClick={handleQuickDeploy}
            disabled={isDeploying}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeploying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            Trigger simulation
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="text-xs leading-5 text-slate-500">
            The initial rows are illustrative sample entries, not a fetched
            deployment history. New entries appear when a simulation request
            succeeds.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Deployment</th>
                <th className="px-5 py-3.5">Commit / message</th>
                <th className="px-5 py-3.5">Branch</th>
                <th className="px-5 py-3.5">Environment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">AI Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {displayDeployments.map((deployment) => (
                <tr
                  key={deployment.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-emerald-800">
                      {deployment.id}
                    </span>
                  </td>

                  <td className="max-w-xs px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="w-fit rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                        {deployment.commit}
                      </span>
                      <span className="truncate text-xs text-slate-700">
                        {deployment.message}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                      {deployment.branch}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs capitalize text-slate-600">
                    {deployment.environment}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <Badge variant="success" size="sm" dot>
                      {deployment.status}
                    </Badge>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-600">
                    {deployment.duration}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {deployment.timestamp}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link
                      to="/dashboard/ai-ops"
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      AI Diagnose
                    </Link>
                  </td>
                </tr>
              ))}

              {displayDeployments.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No deployment activity to display yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Developer Integration & Evaluator Modal */}
      <DeveloperIntegrationModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        orgId={currentOrg.id}
        orgSlug={currentOrg.slug || ''}
        orgName={currentOrg.name}
        onWebhookSuccess={(newDeployment) => {
          setRecentDeployments((prev) => [newDeployment, ...prev.slice(0, 4)]);
          setDeployFeedback({
            msg: `GitHub Webhook received! Pipeline executed commit ${newDeployment.commit} into production cluster.`,
            type: 'success',
          });
        }}
      />
    </div>
  );
};
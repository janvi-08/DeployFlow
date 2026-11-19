import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../features/store';
import { setActiveOrgId } from '../../features/authSlice';
import {
  useGetUsageQuery,
  useGetOrgQuery,
  useGetOrgsQuery,
  useSimulateDeploymentMutation,
  useSimulateApiCallsMutation,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  BarChart3,
  Rocket,
  Users,
  Cpu,
  Zap,
  Play,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

export const UsageAnalyticsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);

  const { data: orgsData } = useGetOrgsQuery();
  const orgs = orgsData?.data || [];
  const currentOrgFallback = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  const effectiveOrgId = currentOrgFallback?.id || activeOrgId || '';

  useEffect(() => {
    if (currentOrgFallback && currentOrgFallback.id !== activeOrgId) {
      dispatch(setActiveOrgId(currentOrgFallback.id));
    }
  }, [currentOrgFallback, activeOrgId, dispatch]);

  const { data: orgData } = useGetOrgQuery(effectiveOrgId, { skip: !effectiveOrgId });
  const { data: usageData, isLoading } = useGetUsageQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });

  const [simulateDeployment, { isLoading: isDeploying }] = useSimulateDeploymentMutation();
  const [simulateApiCalls, { isLoading: isCallingApi }] = useSimulateApiCallsMutation();
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (isLoading || !usageData) {
    return <LoadingSpinner text="Computing organisation usage analytics..." />;
  }

  const summary = usageData.data;
  const currentOrg = orgData?.data;
  const metrics = summary.metrics;

  const handleTestDeployment = async () => {
    if (!effectiveOrgId) return;
    setFeedback(null);
    try {
      const res = await simulateDeployment({ orgId: effectiveOrgId }).unwrap();
      setFeedback({
        msg: `Deployment registered! Used: ${res.data?.currentUsage}/${res.data?.quotaLimit} deployments.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Quota limit reached! Backend rejected with HTTP 429 Too Many Requests.',
        type: 'error',
      });
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleTestApiCalls = async () => {
    if (!effectiveOrgId) return;
    setFeedback(null);
    try {
      const res = await simulateApiCalls({ orgId: effectiveOrgId, count: 50 }).unwrap();
      setFeedback({
        msg: `Processed +50 API calls! New usage: ${res.data?.currentUsage}/${res.data?.quotaLimit} calls.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'API Quota limit reached! Backend rejected with HTTP 429 Too Many Requests.',
        type: 'error',
      });
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const metricCards = [
    {
      key: 'deployments',
      name: 'Automated Deployments',
      icon: Rocket,
      data: metrics.deployments,
      unit: 'runs',
      color: 'emerald',
    },
    {
      key: 'api_calls',
      name: 'API Request Quota',
      icon: Zap,
      data: metrics.api_calls,
      unit: 'calls',
      color: 'amber',
    },
    {
      key: 'build_minutes',
      name: 'CI/CD Build Minutes',
      icon: Cpu,
      data: metrics.build_minutes,
      unit: 'minutes',
      color: 'violet',
    },
    {
      key: 'team_members',
      name: 'Team Seats Utilized',
      icon: Users,
      data: metrics.team_members,
      unit: 'seats',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Usage Analytics & Quotas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time backend quota consumption tracking for {currentOrg?.name} ({summary.plan.toUpperCase()} Plan).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleTestApiCalls}
            disabled={isCallingApi}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500" />
            <span>{isCallingApi ? 'Sending...' : 'Test API Traffic (+50 Calls)'}</span>
          </button>

          <button
            onClick={handleTestDeployment}
            disabled={isDeploying}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>{isDeploying ? 'Deploying...' : 'Trigger Deployment (+1)'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metricCards.map((mc) => {
          const Icon = mc.icon;
          const pct = mc.data.percentage;
          const isExceeded = mc.data.exceeded;
          const isWarning = pct >= 80;

          return (
            <div
              key={mc.key}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm hover:border-emerald-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{mc.name}</h3>
                      <p className="text-[11px] font-mono text-slate-400">Monthly period aggregation</p>
                    </div>
                  </div>

                  <Badge
                    variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'}
                    size="sm"
                    dot
                  >
                    {isExceeded ? 'LIMIT EXCEEDED' : `${pct}% CONSUMED`}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {mc.data.current.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-500">{mc.unit}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Plan Limit: {mc.data.limit.toLocaleString()} {mc.unit}
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>
                  Remaining Quota:{' '}
                  <strong className="text-slate-800 font-semibold">
                    {Math.max(0, mc.data.limit - mc.data.current).toLocaleString()}
                  </strong>
                </span>
                <span className="text-emerald-700 font-semibold">Enforcement: HTTP 429</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quota Enforcement Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
        <div className="flex items-start space-x-3.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Backend Quota Architecture & HTTP 429 Guard</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              How quota verification operates within the DeployFlow middleware stack.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          DeployFlow tracks usage counters partitioned per organisation identifier in MongoDB. Every pipeline dispatch invokes the <code className="bg-slate-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[11px]">quotaGuard</code> middleware. If accumulated monthly deployments exceed the active subscription plan tier, requests are terminated immediately with <code className="bg-slate-100 text-rose-800 px-1.5 py-0.5 rounded font-mono text-[11px]">HTTP 429 (Too Many Requests)</code> before any build containers are allocated.
        </p>
      </div>
    </div>
  );
};

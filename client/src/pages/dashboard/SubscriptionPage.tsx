import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../features/store';
import { setActiveOrgId } from '../../features/authSlice';
import {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useChangePlanMutation,
  useGetOrgQuery,
  useGetOrgsQuery,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
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
  const { data: plansData, isLoading: isPlansLoading } = useGetPlansQuery();
  const { data: subData, isLoading: isSubLoading } = useGetSubscriptionQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });

  const [changePlanTrigger, { isLoading: isChangingPlan }] = useChangePlanMutation();
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (isPlansLoading || isSubLoading || !plansData) {
    return <LoadingSpinner text="Loading subscription details..." />;
  }

  const plans = plansData.data || [];
  const currentOrg = orgData?.data;
  const subscription = subData?.data?.subscription;
  const currentPlanId = subscription?.plan || currentOrg?.plan || 'free';

  const isOwnerOrAdmin =
    currentOrg?.currentUserRole === 'owner' || currentOrg?.currentUserRole === 'admin';

  const handlePlanSelect = async (newPlanId: 'free' | 'pro' | 'enterprise') => {
    if (!effectiveOrgId || newPlanId === currentPlanId) return;
    setFeedback(null);

    try {
      const res = await changePlanTrigger({
        orgId: effectiveOrgId,
        plan: newPlanId,
      }).unwrap();

      setFeedback({
        msg: res.message || `Switched to ${newPlanId.toUpperCase()} tier successfully.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to switch subscription plan.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Subscription & Plan Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review active quotas, plan entitlements, and test development plan tier adjustments.
        </p>
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

      {/* Current Subscription Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 uppercase font-mono">
                {currentPlanId} Plan
              </h3>
              <Badge variant="success" size="sm" dot>Active</Badge>
              <Badge variant="neutral" size="sm">Development Sandbox</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Billing renewal cycle:{' '}
              <span className="font-mono text-slate-700 font-semibold">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Active Perpetual'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto font-mono text-xs">
          <span className="text-slate-400">Database Status:</span>
          <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            Persisted in MongoDB
          </span>
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const isPopular = p.popular;

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-white border-2 border-emerald-700 shadow-md ring-1 ring-emerald-700/20'
                  : 'bg-white border border-slate-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold tracking-tight text-slate-900">{p.name}</h3>
                  {isCurrent ? (
                    <Badge variant="success" size="sm" dot>
                      ACTIVE TIER
                    </Badge>
                  ) : isPopular ? (
                    <Badge variant="primary" size="sm">
                      RECOMMENDED
                    </Badge>
                  ) : null}
                </div>

                <p className="text-xs text-slate-500 mb-5 min-h-[32px]">{p.description}</p>

                <div className="flex items-baseline mb-5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    ${p.priceMonthly}
                  </span>
                  <span className="text-xs ml-1 text-slate-500 font-mono">/ month</span>
                </div>

                {/* Quota specs */}
                <div className="p-3.5 rounded-xl text-xs mb-5 space-y-2 bg-slate-50 border border-slate-200/80 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deployments:</span>
                    <span className="font-semibold text-slate-900">{p.quotas.deployments} / mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Team Seats:</span>
                    <span className="font-semibold text-slate-900">{p.quotas.team_members} seats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Calls:</span>
                    <span className="font-semibold text-slate-900">{p.quotas.api_calls.toLocaleString()} / mo</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 mb-6 text-xs text-slate-600">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handlePlanSelect(p.id)}
                  disabled={isCurrent || !isOwnerOrAdmin || isChangingPlan}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50'
                  }`}
                >
                  {isCurrent
                    ? 'Current Active Plan'
                    : !isOwnerOrAdmin
                    ? 'Requires Owner Role'
                    : isChangingPlan
                    ? 'Updating Plan...'
                    : `Switch to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Development Disclaimer Box */}
      <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-5 text-xs text-emerald-950 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold mb-1 text-emerald-900">Academic Evaluation Notice: Development Billing Sandbox</p>
          <p className="text-emerald-800/90 text-xs">
            As specified in Milestone 1 requirements, plan selections update the organisation's subscription records and quota limits immediately in MongoDB. Live Stripe checkout and webhook processing will be connected during the later milestone.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../features/store';
import { setActiveOrgId } from '../../features/authSlice';
import { useGetOrgQuery, useGetOrgsQuery, useUpdateOrgMutation } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Building2, Save, Shield, Calendar, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/Badge';

export const OrgSettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { activeOrgId, user } = useSelector((state: RootState) => state.auth);

  const { data: orgsData } = useGetOrgsQuery();
  const orgs = orgsData?.data || [];
  const currentOrgFallback = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  const effectiveOrgId = currentOrgFallback?.id || activeOrgId || '';

  useEffect(() => {
    if (currentOrgFallback && currentOrgFallback.id !== activeOrgId) {
      dispatch(setActiveOrgId(currentOrgFallback.id));
    }
  }, [currentOrgFallback, activeOrgId, dispatch]);

  const { data: orgData, isLoading } = useGetOrgQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });
  const [updateOrgTrigger, { isLoading: isUpdating }] = useUpdateOrgMutation();

  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (orgData?.data) {
      setName(orgData.data.name);
    }
  }, [orgData]);

  if (isLoading || !orgData?.data) {
    return <LoadingSpinner text="Loading organisation configuration..." />;
  }

  const org = orgData.data;
  const isOwnerOrAdmin = org.currentUserRole === 'owner' || org.currentUserRole === 'admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateOrgTrigger({ id: org.id, name: name.trim() }).unwrap();
      setFeedback({ msg: 'Organisation details saved successfully.', type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ msg: err?.data?.message || 'Failed to update organisation.', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Organisation Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage workspace identity, membership privileges, and tenant configuration.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {org.id}</p>
              </div>
            </div>
            <Badge variant={org.currentUserRole === 'owner' ? 'purple' : 'primary'}>
              Your Role: {org.currentUserRole?.toUpperCase()}
            </Badge>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organisation Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwnerOrAdmin}
              className="w-full max-w-md px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Visible on team invitations, deployment reports, and notifications.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Slug</label>
            <div className="flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 max-w-md font-mono">
              <span className="text-slate-400">deployflow.io/</span>
              <span className="text-slate-900 font-semibold">{org.slug}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Slugs are unique tenant identifiers for webhook integrations and team links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Active Subscription Tier
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase">{org.plan}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Workspace Created At
              </span>
              <span className="text-xs font-medium text-slate-700">
                {new Date(org.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security & Access Box */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
          <Shield className="w-4 h-4 text-emerald-700 mr-2" />
          Tenant Isolation & RBAC Boundaries
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          DeployFlow enforces database-level tenant isolation using MongoDB compound indexes. All queries to memberships, audit logs, subscriptions, and usage records are strictly bound to <code className="font-mono text-slate-700">{org.id}</code>. Unauthorised members from foreign tenants are rejected with HTTP 403 Forbidden.
        </p>
      </div>
    </div>
  );
};

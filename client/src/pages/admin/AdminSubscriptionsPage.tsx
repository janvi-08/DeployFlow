import React from 'react';
import { useGetAdminSubscriptionsQuery } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { CreditCard, Calendar } from 'lucide-react';

export const AdminSubscriptionsPage: React.FC = () => {
  const { data: subsData, isLoading } = useGetAdminSubscriptionsQuery();

  if (isLoading) {
    return <LoadingSpinner text="Retrieving platform subscriptions..." />;
  }

  const subscriptions = subsData?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Subscription Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all active and trialing subscriptions across tenant organisations.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span className="text-sm font-bold text-slate-900">
              Active Subscriptions ({subscriptions.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Organisation</th>
                <th className="py-3 px-6">Plan Tier</th>
                <th className="py-3 px-6">Billing Status</th>
                <th className="py-3 px-6">Current Period End</th>
                <th className="py-3 px-6 text-right">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    {sub.org ? sub.org.name : 'Unassigned'}
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        sub.plan === 'enterprise'
                          ? 'purple'
                          : sub.plan === 'pro'
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {sub.plan.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>
                      {sub.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right text-slate-500">
                    {sub.cancelAtPeriodEnd ? 'Cancels at Period End' : 'Enabled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useGetAdminOrgsQuery } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { Building2, Users, Calendar } from 'lucide-react';

export const AdminOrgsPage: React.FC = () => {
  const { data: orgsData, isLoading } = useGetAdminOrgsQuery();

  if (isLoading) {
    return <LoadingSpinner text="Retrieving platform organisations..." />;
  }

  const orgs = orgsData?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Platform Organisation Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Supervisory directory of all organisations registered on the DeployFlow cluster.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="text-sm font-bold text-slate-900">Total Organisations ({orgs.length})</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Organisation</th>
                <th className="py-3 px-6">Slug</th>
                <th className="py-3 px-6">Owner</th>
                <th className="py-3 px-6">Plan Tier</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgs.map((org: any) => (
                <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{org.name}</td>
                  <td className="py-4 px-6 font-mono text-slate-500">/{org.slug}</td>
                  <td className="py-4 px-6 text-slate-600">
                    {org.owner ? (
                      <div>
                        <p className="font-medium text-slate-800">{org.owner.name}</p>
                        <p className="text-[11px] text-slate-400">{org.owner.email}</p>
                      </div>
                    ) : (
                      'System'
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant={
                        org.plan === 'enterprise'
                          ? 'purple'
                          : org.plan === 'pro'
                          ? 'primary'
                          : 'neutral'
                      }
                    >
                      {org.plan.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={org.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                      {org.subscriptionStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right text-slate-400">
                    {new Date(org.createdAt).toLocaleDateString()}
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

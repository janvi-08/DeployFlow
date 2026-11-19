import React from 'react';
import { useGetAdminHealthQuery } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import {
  Server,
  Activity,
  Database,
  Cpu,
  HardDrive,
  Users,
  Building2,
  Rocket,
  RefreshCw,
} from 'lucide-react';

export const AdminHealthPage: React.FC = () => {
  const { data: healthData, isLoading, refetch, isFetching } = useGetAdminHealthQuery(undefined, {
    pollingInterval: 10000, // Poll health every 10 seconds
  });

  if (isLoading) {
    return <LoadingSpinner text="Querying backend system telemetry..." />;
  }

  const health = healthData?.data;

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System Health & Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time process liveness, memory heap analysis, and active infrastructure metrics.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Primary Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Process State</span>
              <p className="text-base font-bold text-slate-900 capitalize flex items-center space-x-1.5">
                <span>{health?.status || 'Online'}</span>
                <Badge variant="success">200 OK</Badge>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">MongoDB Replica</span>
              <p className="text-base font-bold text-slate-900 capitalize flex items-center space-x-1.5">
                <span>{health?.database || 'Connected'}</span>
                <Badge variant="success">Read/Write</Badge>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Process Uptime</span>
              <p className="text-base font-bold font-mono text-slate-900">
                {health?.uptimeSeconds ? formatUptime(health.uptimeSeconds) : '0s'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Runtime Engine</span>
              <p className="text-base font-bold font-mono text-slate-900">
                Node {health?.nodeVersion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Heap and System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <HardDrive className="w-4 h-4 text-emerald-700 mr-2" />
            V8 Memory Heap Utilization
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Heap Used / Heap Total:</span>
                <span className="font-semibold text-slate-800">
                  {health?.memory.heapUsedMb} MB / {health?.memory.heapTotalMb} MB
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((health?.memory.heapUsedMb || 1) / (health?.memory.heapTotalMb || 2)) * 100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Resident Set Size (RSS)</span>
                <span className="font-bold text-slate-800">{health?.memory.rssMb} MB</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Available CPU Cores</span>
                <span className="font-bold text-slate-800">{health?.cpus} Virtual Cores</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Counters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <Server className="w-4 h-4 text-emerald-700 mr-2" />
            Cluster Entity Aggregations
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <Users className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
              <span className="text-xl font-extrabold text-slate-900 block">
                {health?.metrics.totalUsers ?? 0}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total Users</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <Building2 className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
              <span className="text-xl font-extrabold text-slate-900 block">
                {health?.metrics.totalOrganisations ?? 0}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total Orgs</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <Rocket className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <span className="text-xl font-extrabold text-slate-900 block">
                {health?.metrics.totalDeploymentsRecorded ?? 0}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Deployments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

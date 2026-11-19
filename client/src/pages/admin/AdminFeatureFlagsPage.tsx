import React, { useState } from 'react';
import {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { Flag, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';

export const AdminFeatureFlagsPage: React.FC = () => {
  const { data: flagsData, isLoading } = useGetFeatureFlagsQuery();
  const [updateFlagTrigger, { isLoading: isUpdating }] = useUpdateFeatureFlagMutation();
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (isLoading) {
    return <LoadingSpinner text="Retrieving dynamic feature flags..." />;
  }

  const flags = flagsData?.data || [];

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setFeedback(null);
    try {
      await updateFlagTrigger({ key, enabled: !currentEnabled }).unwrap();
      setFeedback({
        msg: `Feature flag '${key}' updated to ${!currentEnabled ? 'ENABLED' : 'DISABLED'}.`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to update feature flag.',
        type: 'error',
      });
    }
  };

  const handleRolloutChange = async (key: string, rolloutPct: number) => {
    try {
      await updateFlagTrigger({ key, rolloutPct }).unwrap();
    } catch (e) {
      // Ignore rapid slider changes
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Feature Flag Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Dynamically toggle features, adjust canary rollout percentages, and configure plan access rules.
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

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900">{flag.key}</span>
                <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                  {flag.enabled ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{flag.description}</p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[11px] text-slate-400">Available to:</span>
                {flag.enabledForPlans.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6 self-start md:self-auto">
              {/* Rollout Percentage Slider */}
              <div className="w-36">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Rollout:</span>
                  <span>{flag.rolloutPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flag.rolloutPct}
                  onChange={(e) => handleRolloutChange(flag.key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Toggle switch button */}
              <button
                onClick={() => handleToggle(flag.key, flag.enabled)}
                disabled={isUpdating}
                className={`p-1 rounded-full transition-colors ${
                  flag.enabled ? 'text-emerald-700' : 'text-slate-300'
                }`}
                title="Toggle feature status"
              >
                {flag.enabled ? (
                  <ToggleRight className="w-9 h-9" />
                ) : (
                  <ToggleLeft className="w-9 h-9" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

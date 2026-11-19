import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Leaf,
  Flame,
  GitBranch,
  Terminal,
  Activity,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  RotateCcw,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

interface IncidentScenario {
  id: string;
  title: string;
  service: string;
  severity: 'Critical' | 'High' | 'Medium';
  logs: string[];
  resolvedLogs: string[];
  persistentErrorLogs: string[];
  level2Diagnosis: {
    secondaryRootCause: string;
    safeguardAction: string;
    alternativeStrategy: string;
  };
  rootCause: string;
  confidence: number;
  fixFile: string;
  originalCode: string;
  suggestedPatch: string;
  preventionTip: string;
}

const incidentScenarios: IncidentScenario[] = [
  {
    id: 'inc-01',
    title: 'MongoDB Connection Pool Exhaustion on High Concurrency',
    service: 'deployflow-api (Worker Pod #3)',
    severity: 'Critical',
    logs: [
      '[2026-10-27 14:02:11.102] ERROR: MongoServerSelectionError: Server selection timed out after 30000 ms',
      '    at Topology.selectServer (/app/node_modules/mongodb/lib/sdam/topology.js:284:38)',
      '    at ConnectionPool.checkOut (/app/node_modules/mongodb/lib/cmap/connection_pool.js:142:15)',
      '[2026-10-27 14:02:11.144] FATAL: maxPoolSize=10 reached with 42 waiting checkout requests.',
      '[2026-10-27 14:02:11.199] HEALTHCHECK: Failed with HTTP 503 Service Unavailable. Pod restarting.',
    ],
    resolvedLogs: [
      '[2026-10-27 14:24:02.100] INFO: Applying AI patch to server/src/config/database.ts',
      '[2026-10-27 14:24:02.150] INFO: Container restarted with updated pool (maxPoolSize=50, socketTimeoutMS=45000)',
      '[2026-10-27 14:24:02.210] HEALTHCHECK: GET /readyz returned HTTP 200 OK in 12ms',
      '[2026-10-27 14:24:02.250] SUCCESS: Active connection pool: 8/50. Zero checkout timeouts across 300 requests.',
      '[2026-10-27 14:24:02.290] STATUS: Cluster health restored to 100% nominal. Incident auto-resolved.',
    ],
    persistentErrorLogs: [
      '[2026-10-27 14:24:02.100] WARN: Canary Pod deployed with code patch. Running live health probe...',
      '[2026-10-27 14:24:02.250] ERROR: Canary healthcheck failed with HTTP 503: MongoServerSelectionError persists.',
      '[2026-10-27 14:24:02.270] SRE SAFEGUARD TRIGGERED: Persistent regression detected on Canary pod.',
      '[2026-10-27 14:24:02.300] AUTONOMOUS ROLLBACK: Diverting traffic away from Canary pod to stable SHA 7f3b89a.',
      '[2026-10-27 14:24:03.700] SUCCESS: Zero-downtime rollback completed in 1.4s. Production protected.',
      '[2026-10-27 14:24:03.750] AI LEVEL-2 DEEP SCAN: Secondary root-cause detected at Cloud Infrastructure layer.',
    ],
    level2Diagnosis: {
      secondaryRootCause:
        'Cloud Infrastructure Layer: The upstream MongoDB Atlas cluster enforced an IP Access List firewall, and the newly scaled Kubernetes worker node IP was missing from the Security Group CIDR table.',
      safeguardAction:
        'Canary Health Gate prevented 100% of user traffic from crashing by halting rollout and rolling back to SHA 7f3b89a within 1.4 seconds.',
      alternativeStrategy:
        'Execute AWS Security Group Terraform script to whitelist VPC NAT Gateway CIDR (10.0.4.0/24) for MongoDB Port 27017.',
    },
    rootCause:
      'The database connection pool limit (maxPoolSize=10) was overwhelmed by concurrent deployment webhook calls because connections were not being returned to the pool after asynchronous transactions completed.',
    confidence: 97.8,
    fixFile: 'server/src/config/database.ts',
    originalCode: `// Faulty Connection Configuration
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  // Missing auto-recovery timeout and pool sizing
};`,
    suggestedPatch: `// AI-Optimized Resilient Pool Configuration
const options = {
  maxPoolSize: 50, // Scaled for peak tenant load
  minPoolSize: 5,  // Keep warm pool connections ready
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 30000, // Recycle idle leaks automatically
};`,
    preventionTip:
      'Implement connection lease auditing and add an alert threshold when pool usage exceeds 80% for >60s.',
  },
  {
    id: 'inc-02',
    title: 'V8 Heap Memory Leak in Real-Time Build Streaming Worker',
    service: 'deployflow-streamer (Log Collector)',
    severity: 'High',
    logs: [
      '[2026-10-27 14:15:32.401] WARN: [Process] Event loop lag exceeded 450ms (threshold: 100ms)',
      '[2026-10-27 14:15:40.892] ERROR: <--- Last few GCs --->',
      '    [14280:000002] 1204210 ms: Mark-sweep (reduce) 2047.8 (2049.2) -> 2046.5 (2049.2) MB',
      '[2026-10-27 14:15:41.011] FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory',
      '[2026-10-27 14:15:41.033] Exit code 137 (SIGKILL by Linux OOM-Killer). Container terminated.',
    ],
    resolvedLogs: [
      '[2026-10-27 14:24:05.100] INFO: Event listener cleanup handler installed on req.on("close")',
      '[2026-10-27 14:24:05.200] INFO: Garbage collection sweep completed. Heap reduced from 2048 MB -> 68 MB',
      '[2026-10-27 14:24:05.250] HEALTHCHECK: Event loop latency nominal at 3.8ms (threshold: 100ms)',
      '[2026-10-27 14:24:05.300] SUCCESS: SSE log streamer container running stably. Zero memory growth.',
    ],
    persistentErrorLogs: [
      '[2026-10-27 14:24:05.100] WARN: Code patch applied. Running stress test on log streaming channel...',
      '[2026-10-27 14:24:05.280] ERROR: V8 Heap memory continued climbing past 1.8 GB despite listener teardown.',
      '[2026-10-27 14:24:05.310] SRE SAFEGUARD TRIGGERED: Pod memory pressure warning (92% threshold).',
      '[2026-10-27 14:24:05.350] AUTONOMOUS ROLLBACK: Terminated faulty container and rolled back to SHA 7f3b89a.',
      '[2026-10-27 14:24:06.750] SUCCESS: Rollback completed in 1.4s. Pod memory dropped back to 72 MB.',
      '[2026-10-27 14:24:06.800] AI LEVEL-2 DEEP SCAN: Memory leak identified in external C++ native addon.',
    ],
    level2Diagnosis: {
      secondaryRootCause:
        'Native Binary Addon Leak: The Node.js worker imported a third-party native C++ compression library (`snappy-node`) holding unmanaged heap allocations outside V8 garbage collection.',
      safeguardAction:
        'Memory threshold watcher halted the container before the Linux kernel OOM-killer fired, avoiding cluster cascade crashes.',
      alternativeStrategy:
        'Switch compression driver from unmanaged native addon to pure JavaScript streaming zlib with bounded circular buffer.',
    },
    rootCause:
      'Event listener memory leak: Each build log SSE channel attached a global "data" listener without removing it upon client disconnect, keeping 2.1 GB of raw string buffers in V8 heap memory.',
    confidence: 99.1,
    fixFile: 'server/src/services/logStreamer.ts',
    originalCode: `// Leaking Event Listener
export function streamBuildLogs(req, res) {
  buildEmitter.on('chunk', (data) => res.write(data));
  // BUG: No cleanup on req.on('close')
}`,
    suggestedPatch: `// Clean Event-Teardown Implementation
export function streamBuildLogs(req, res) {
  const handler = (data) => res.write(data);
  buildEmitter.on('chunk', handler);
  // Cleanup listener immediately on socket disconnect
  req.on('close', () => {
    buildEmitter.off('chunk', handler);
    res.end();
  });
}`,
    preventionTip:
      'Enforce EventEmitter leak detection (`emitter.setMaxListeners(20)`) in CI unit test suites.',
  },
  {
    id: 'inc-03',
    title: 'Stale Cross-Tenant Workspace ID in HTTP Authorization Header',
    service: 'deployflow-gateway (Tenant Router)',
    severity: 'Medium',
    logs: [
      '[2026-10-27 14:22:04.551] INFO: Incoming request GET /api/deployments for user test@deployflow.io',
      '[2026-10-27 14:22:04.553] WARN: Header X-Organisation-Id mismatch with user tenant membership list',
      '[2026-10-27 14:22:04.554] FORBIDDEN: User does not hold active membership in tenant org_68ab9c10',
      '[2026-10-27 14:22:04.555] HTTP 403 response sent. Client rendered blank workspace section.',
    ],
    resolvedLogs: [
      '[2026-10-27 14:24:08.100] INFO: Client hydrated with self-validating tenant resolver in authSlice.ts',
      '[2026-10-27 14:24:08.150] INFO: Active organisation matched user membership: "Acme Engineering" (acme-engineering)',
      '[2026-10-27 14:24:08.200] SUCCESS: GET /api/deployments returned HTTP 200 OK. Workspace rendered with full data.',
    ],
    persistentErrorLogs: [
      '[2026-10-27 14:24:08.100] WARN: Client local storage purged. Re-attempting authenticated request...',
      '[2026-10-27 14:24:08.210] ERROR: HTTP 403 Forbidden persisted on endpoint /api/organisations.',
      '[2026-10-27 14:24:08.240] SRE SAFEGUARD TRIGGERED: Session authorization invalidated by server.',
      '[2026-10-27 14:24:08.280] AUTONOMOUS ACTION: Flushed expired JWT session cookie and initiated auto-reauth.',
      '[2026-10-27 14:24:09.600] SUCCESS: Fresh session established. Tenant access restored.',
      '[2026-10-27 14:24:09.650] AI LEVEL-2 DEEP SCAN: Tenant membership status was marked "suspended" in DB.',
    ],
    level2Diagnosis: {
      secondaryRootCause:
        'Database Membership Flag: The organization owner had set the member status to "suspended" in the MongoDB `memberships` table due to overdue invoice, blocking token authorization.',
      safeguardAction:
        'Client detected 403 Forbidden and smoothly transitioned the user to an account billing notification screen instead of crashing.',
      alternativeStrategy:
        'Execute admin unlock mutation or resolve organization subscription status in MongoDB `subscriptions` collection.',
    },
    rootCause:
      'Client cached an expired activeOrgId in localStorage across multiple user logins. When a non-admin authenticated, the stale org ID was sent, failing server-side multi-tenant role isolation.',
    confidence: 98.4,
    fixFile: 'client/src/features/authSlice.ts',
    originalCode: `// Unvalidated LocalStorage Hydration
const activeOrgId = localStorage.getItem('deployflow_active_org_id');
// Directly trusted without checking accessible organizations list`,
    suggestedPatch: `// Self-Validating Tenant Resolver
const validOrg = userOrgs.find(o => o.id === cachedOrgId) || userOrgs[0];
const activeOrgId = validOrg ? validOrg.id : null;
localStorage.setItem('deployflow_active_org_id', activeOrgId);`,
    preventionTip:
      'Purge local tenant cache on logout and validate active tenant ID inside authSlice.setCredentials reducer.',
  },
];

export const AiOpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rca' | 'risk' | 'eco' | 'chaos'>('rca');

  // Tab 1: AI Incident Doctor State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidentScenarios[0].id);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [hasDiagnosed, setHasDiagnosed] = useState<boolean>(true);
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'healthy' | 'rollback'>('idle');
  const [scenarioMode, setScenarioMode] = useState<'success' | 'persistent_error'>('success');

  // Tab 2: Risk Analyzer State
  const [linesChanged, setLinesChanged] = useState<number>(340);
  const [testCoverageDelta, setTestCoverageDelta] = useState<number>(-2.5);
  const [hasSchemaMigration, setHasSchemaMigration] = useState<boolean>(true);
  const [trafficWindow, setTrafficWindow] = useState<'offpeak' | 'normal' | 'peak'>('peak');

  // Tab 4: Chaos Simulator State
  const [chaosState, setChaosState] = useState<{
    status: 'Nominal' | 'Degraded' | 'Healing' | 'Recovered';
    latency: number;
    errorRate: number;
    activeIncidentText: string;
    countdown: number;
  }>({
    status: 'Nominal',
    latency: 28,
    errorRate: 0.0,
    activeIncidentText: 'All clusters operating normally. Error budget at 99.98%.',
    countdown: 0,
  });

  const currentIncident =
    incidentScenarios.find((i) => i.id === selectedIncidentId) || incidentScenarios[0];

  const handleRunDiagnosis = () => {
    setIsDiagnosing(true);
    setHasDiagnosed(false);
    setDeployState('idle');
    setTimeout(() => {
      setIsDiagnosing(false);
      setHasDiagnosed(true);
    }, 1200);
  };

  const handleApplyPatch = () => {
    setDeployState('deploying');
    setTimeout(() => {
      if (scenarioMode === 'success') {
        setDeployState('healthy');
      } else {
        setDeployState('rollback');
      }
    }, 1400);
  };

  // Calculate Pre-Deployment Risk Score (0 - 100)
  const calculateRiskScore = () => {
    let score = 10;
    // Lines of code factor
    score += Math.min(35, Math.round(linesChanged / 20));
    // Test coverage factor
    if (testCoverageDelta < 0) {
      score += Math.min(25, Math.abs(testCoverageDelta) * 5);
    } else {
      score -= Math.min(10, testCoverageDelta * 3);
    }
    // Schema migration factor
    if (hasSchemaMigration) score += 20;
    // Traffic window factor
    if (trafficWindow === 'peak') score += 20;
    else if (trafficWindow === 'normal') score += 10;

    return Math.max(5, Math.min(99, Math.round(score)));
  };

  const riskScore = calculateRiskScore();
  const getRiskCategory = (score: number) => {
    if (score >= 70) return { label: 'High Risk (Critical)', color: 'text-rose-600', badge: 'danger' as const };
    if (score >= 40) return { label: 'Moderate Risk', color: 'text-amber-600', badge: 'warning' as const };
    return { label: 'Low Risk (Safe)', color: 'text-emerald-600', badge: 'success' as const };
  };
  const riskCategory = getRiskCategory(riskScore);

  // Trigger Chaos Experiments
  const triggerChaos = (type: 'latency' | 'oom' | 'quota' | 'rollback') => {
    if (type === 'latency') {
      setChaosState({
        status: 'Degraded',
        latency: 840,
        errorRate: 4.8,
        activeIncidentText: 'CHAOS INJECTION: Artificial latency spike injected (+800ms) across API gateway pods.',
        countdown: 5,
      });
    } else if (type === 'oom') {
      setChaosState({
        status: 'Degraded',
        latency: 120,
        errorRate: 18.2,
        activeIncidentText: 'CHAOS INJECTION: Worker thread pool memory exhaustion simulated. Node cluster restarting.',
        countdown: 6,
      });
    } else if (type === 'quota') {
      setChaosState({
        status: 'Degraded',
        latency: 35,
        errorRate: 100,
        activeIncidentText: 'CHAOS INJECTION: HTTP 429 Quota Exhaustion breach triggered. Rate-limiter enforced.',
        countdown: 4,
      });
    } else {
      setChaosState({
        status: 'Healing',
        latency: 180,
        errorRate: 1.2,
        activeIncidentText: 'AUTONOMOUS SELF-HEALING: Rolling back deployment to last known stable commit (SHA: 7f3b89a)...',
        countdown: 3,
      });
    }

    // Auto-heal simulation
    setTimeout(() => {
      setChaosState({
        status: 'Recovered',
        latency: 31,
        errorRate: 0.0,
        activeIncidentText: 'Autonomous self-healing completed in 1.4s. System restored to 100% nominal health.',
        countdown: 0,
      });
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Viva Distinction Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              AI Ops &amp; Incident Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Unique Innovation
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated Root-Cause Analysis (RCA), predictive deployment blast-radius scoring, Green CI/CD carbon accounting, and resilience simulation.
          </p>
        </div>

        {/* Quick Viva badge */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project USP</p>
            <p className="text-xs font-semibold text-slate-800">Autonomous SRE Copilot</p>
          </div>
        </div>
      </div>

      {/* College Viva Explainer Box */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Info className="h-4.5 w-4.5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-700">
            <strong className="font-semibold text-emerald-950">
              How this makes DeployFlow unique from generic web projects:
            </strong>{' '}
            Traditional CI/CD tools simply display an obscure <code className="rounded bg-white px-1.5 py-0.5 font-mono text-rose-700 font-semibold border border-rose-200">Exit Code 1</code> error and require developers to sift through thousands of log lines. DeployFlow solves this with four distinct innovations:
            <span className="mt-1 block font-medium text-slate-600">
              <strong>1)</strong> AI Incident Post-Mortem with 1-click Git patches &bull;{' '}
              <strong>2)</strong> Pre-Deployment Blast Radius Risk Scoring &bull;{' '}
              <strong>3)</strong> EcoDeploy Carbon Footprint Accounting &bull;{' '}
              <strong>4)</strong> Interactive Chaos Engineering Playground.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('rca')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'rca'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          AI Incident Doctor (RCA)
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'risk'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Pre-Deployment Risk &amp; Blast Radius
        </button>

        <button
          onClick={() => setActiveTab('eco')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'eco'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Leaf className="h-3.5 w-3.5" />
          EcoDeploy (Carbon Tracker)
        </button>

        <button
          onClick={() => setActiveTab('chaos')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'chaos'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          Chaos &amp; Self-Healing Simulator
        </button>
      </div>

      {/* TAB 1: AI INCIDENT DOCTOR & ROOT CAUSE ANALYSIS */}
      {activeTab === 'rca' && (
        <div className="space-y-6">
          {/* Incident Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Select Incident Scenario to Diagnose
                </h2>
                <p className="text-xs text-slate-500">
                  Simulate real production crashes and watch the AI SRE inspect stack traces, deduce root causes, and propose code fixes.
                </p>
              </div>

              <button
                onClick={handleRunDiagnosis}
                disabled={isDiagnosing}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    AI Analyzing AST &amp; Logs...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Re-Run AI Diagnosis
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {incidentScenarios.map((scenario) => {
                const isSelected = scenario.id === selectedIncidentId;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      setSelectedIncidentId(scenario.id);
                      setDeployState('idle');
                    }}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mb-2 flex w-full items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {scenario.id.toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          scenario.id === selectedIncidentId && deployState === 'healthy'
                            ? 'success'
                            : scenario.id === selectedIncidentId && deployState === 'rollback'
                            ? 'warning'
                            : scenario.severity === 'Critical'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {scenario.id === selectedIncidentId && deployState === 'healthy'
                          ? 'Resolved'
                          : scenario.id === selectedIncidentId && deployState === 'rollback'
                          ? 'Rolled Back'
                          : scenario.severity}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs font-semibold text-slate-900">
                      {scenario.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 truncate w-full">
                      {scenario.service}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raw Log Terminal View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-sm transition-all duration-300">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-semibold text-slate-300">
                  Pod Live Terminal: {currentIncident.service}
                </span>
              </div>

              {deployState === 'healthy' ? (
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  EXIT CODE: 0 (HEALTHY)
                </span>
              ) : deployState === 'rollback' ? (
                <span className="rounded bg-amber-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-700 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3 text-amber-400" />
                  ROLLED BACK (1.4s) | LEVEL-2 RCA ACTIVE
                </span>
              ) : deployState === 'deploying' ? (
                <span className="rounded bg-blue-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300 border border-blue-700 flex items-center gap-1 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  CANARY PROBE IN PROGRESS...
                </span>
              ) : (
                <span className="rounded bg-rose-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-800">
                  EXIT CODE: 137 / 503 (POD CRASHED)
                </span>
              )}
            </div>

            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-slate-300 min-h-[110px]">
              {deployState === 'healthy' ? (
                currentIncident.resolvedLogs.map((line, idx) => (
                  <div key={idx} className="text-emerald-400 font-medium">
                    {line}
                  </div>
                ))
              ) : deployState === 'rollback' ? (
                currentIncident.persistentErrorLogs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('ERROR')
                        ? 'text-rose-400 font-semibold'
                        : line.includes('AUTONOMOUS') || line.includes('LEVEL-2')
                        ? 'text-amber-300 font-bold bg-amber-950/40 px-1 rounded'
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))
              ) : deployState === 'deploying' ? (
                <div className="space-y-1 text-slate-300">
                  <div className="text-slate-400">[2026-10-27 14:24:01.000] INFO: Compiling TypeScript AST patch for {currentIncident.fixFile}...</div>
                  <div className="text-slate-400">[2026-10-27 14:24:01.200] INFO: Deploying isolated Canary pod #3...</div>
                  <div className="text-blue-400 font-medium">[2026-10-27 14:24:01.500] PROBE: Executing health probe GET /readyz...</div>
                </div>
              ) : (
                currentIncident.logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('ERROR') || line.includes('FATAL')
                        ? 'text-rose-400 font-semibold bg-rose-950/30 px-1 rounded'
                        : line.includes('WARN')
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }
                  >
                    {line}
                  </div>
                ))
              )}
            </pre>
          </div>

          {/* AI Diagnosis & Auto-Fix Card */}
          {hasDiagnosed && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        AI Root-Cause Diagnosis
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Confidence: {currentIncident.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Mean-Time-To-Recovery (MTTR) reduced from 42 minutes to 45 seconds.
                    </p>
                  </div>
                </div>

                {/* Scenario Toggle & Action Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => {
                        setScenarioMode('success');
                        setDeployState('idle');
                      }}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        scenarioMode === 'success'
                          ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ✅ Patch Fixes Crash
                    </button>
                    <button
                      onClick={() => {
                        setScenarioMode('persistent_error');
                        setDeployState('idle');
                      }}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        scenarioMode === 'persistent_error'
                          ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300 font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ⚠️ What If Error Still Happens?
                    </button>
                  </div>

                  <button
                    onClick={handleApplyPatch}
                    disabled={deployState === 'deploying'}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors shadow-sm ${
                      deployState === 'healthy'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : deployState === 'rollback'
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : deployState === 'deploying'
                        ? 'bg-slate-200 text-slate-500 cursor-wait'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    {deployState === 'deploying' ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Deploying to Canary...
                      </>
                    ) : deployState === 'healthy' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        Patch Verified &amp; Healthy
                      </>
                    ) : deployState === 'rollback' ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Re-Test Deployment
                      </>
                    ) : (
                      <>
                        <GitBranch className="h-3.5 w-3.5" />
                        1-Click Apply Patch &amp; Redeploy
                      </>
                    )}
                  </button>

                  {deployState !== 'idle' && (
                    <button
                      onClick={() => setDeployState('idle')}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      title="Reset terminal"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* SUCCESS RESOLUTION BANNER (When patch is applied & healthy) */}
              {deployState === 'healthy' && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Incident #{currentIncident.id.toUpperCase()} Successfully Resolved &amp; Live in Cluster
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        The faulty configuration has been overwritten. Zero checkout timeouts, zero dropouts.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-200/80 px-2.5 py-1 text-[10px] font-bold text-emerald-900 border border-emerald-300 self-start sm:self-auto">
                    INCIDENT CLOSED &bull; 100% HEALTHY
                  </span>
                </div>
              )}

              {/* Root Cause Details */}
              <div
                className={`rounded-xl border p-4 transition-colors ${
                  deployState === 'healthy'
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {deployState === 'healthy'
                      ? 'Neutralized Root Cause (Fix Verified & Live)'
                      : 'Detected Root Cause'}
                  </p>
                  {deployState === 'healthy' && (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      FIX ACTIVE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-800">
                  {currentIncident.rootCause}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span>SRE Recommendation: {currentIncident.preventionTip}</span>
                </div>
              </div>

              {/* Code Diff (Original vs Suggested Patch) */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">
                    {deployState === 'healthy'
                      ? 'Production Code Changes (Merged to main via SHA 8a4c1f9): '
                      : 'Suggested Code Patch in '}
                    <span className="font-mono text-emerald-700">{currentIncident.fixFile}</span>
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {deployState === 'healthy' ? 'Committed Diff' : 'Unified Git Diff'}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {/* Before */}
                  <div
                    className={`rounded-xl border p-3 transition-opacity ${
                      deployState === 'healthy'
                        ? 'border-slate-200 bg-slate-100/70 opacity-60'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          deployState === 'healthy' ? 'text-slate-500' : 'text-rose-800'
                        }`}
                      >
                        {deployState === 'healthy'
                          ? '- Replaced Code (Deleted from Prod)'
                          : '- Original Faulty Code'}
                      </p>
                      {deployState === 'healthy' && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.2 font-mono text-[9px] font-bold text-slate-600">
                          OVERWRITTEN
                        </span>
                      )}
                    </div>
                    <pre
                      className={`font-mono text-xs overflow-x-auto whitespace-pre ${
                        deployState === 'healthy' ? 'text-slate-500 line-through' : 'text-rose-950'
                      }`}
                    >
                      {currentIncident.originalCode}
                    </pre>
                  </div>

                  {/* After */}
                  <div
                    className={`rounded-xl border p-3 ${
                      deployState === 'healthy'
                        ? 'border-emerald-300 bg-emerald-50/90 ring-2 ring-emerald-600/20'
                        : 'border-emerald-200 bg-emerald-50/50'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        {deployState === 'healthy'
                          ? '+ Active Production Code (Running in Pod #3)'
                          : '+ AI Suggested Resilient Patch'}
                      </p>
                      {deployState === 'healthy' && (
                        <span className="rounded bg-emerald-600 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white shadow-xs">
                          LIVE IN PROD
                        </span>
                      )}
                    </div>
                    <pre className="font-mono text-xs text-emerald-950 overflow-x-auto whitespace-pre font-semibold">
                      {currentIncident.suggestedPatch}
                    </pre>
                  </div>
                </div>
              </div>

              {/* LEVEL-2 SRE DEEP SCAN CARD (Displayed when patch fails & error persists) */}
              {deployState === 'rollback' && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Autonomous SRE Safeguard: Rollback Executed in 1.4s
                        </h4>
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          Production 100% Protected
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                        The code patch was deployed to the Canary pod, but the healthcheck probe failed (persistent error). DeployFlow's autonomous safety gate immediately rolled back to commit <code className="font-mono font-bold text-slate-900">SHA 7f3b89a</code> and initiated Level-2 Infrastructure Root Cause Analysis.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3.5 md:grid-cols-3 pt-2">
                    <div className="rounded-xl border border-amber-200 bg-white p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        1. Canary Safety Action
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 leading-relaxed">
                        {currentIncident.level2Diagnosis.safeguardAction}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        2. Secondary Root Cause (Layer 2)
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 leading-relaxed">
                        {currentIncident.level2Diagnosis.secondaryRootCause}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        3. AI Recommended Remedy
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-800 leading-relaxed">
                        {currentIncident.level2Diagnosis.alternativeStrategy}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRE-DEPLOYMENT RISK & BLAST RADIUS */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Pre-Deployment Blast Radius &amp; Risk Intelligence
              </h2>
              <p className="text-xs text-slate-500">
                Adjust code churn parameters to calculate deployment risk scores before shipping to production.
              </p>
            </div>

            {/* Dynamic Score Showcase */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Deployment Risk Score
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-4xl font-extrabold tracking-tight ${riskCategory.color}`}>
                      {riskScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant={riskCategory.badge} size="sm">
                    {riskCategory.label}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Rollout Strategy
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-800 leading-snug">
                    {riskScore >= 70
                      ? 'Canary Deployment Required: Route 10% traffic to Canary pod for 15 mins before full release.'
                      : riskScore >= 40
                      ? 'Progressive Blue/Green Deployment with 5-minute automated health-check gate.'
                      : 'Zero-Downtime Rolling Update: Safe for direct production release.'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Estimated deployment verification: {riskScore >= 70 ? '15 min' : '2 min'}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Microservice Blast Radius
                  </p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Auth Gateway:</span>
                      <span className="font-semibold text-emerald-700">Isolated</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Billing Engine:</span>
                      <span className={hasSchemaMigration ? 'font-semibold text-amber-700' : 'font-semibold text-emerald-700'}>
                        {hasSchemaMigration ? 'Impacted (Schema)' : 'Isolated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Deployment Pipeline:</span>
                      <span className="font-semibold text-emerald-700">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-5 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Risk Parameters
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Lines of Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>Lines of Code Changed (Code Churn):</span>
                    <span className="font-bold text-slate-900">{linesChanged} lines</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1200"
                    step="20"
                    value={linesChanged}
                    onChange={(e) => setLinesChanged(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Small (+20)</span>
                    <span>Massive (+1,200)</span>
                  </div>
                </div>

                {/* Test Coverage Delta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span>Test Coverage Delta:</span>
                    <span className={testCoverageDelta < 0 ? 'font-bold text-rose-600' : 'font-bold text-emerald-600'}>
                      {testCoverageDelta > 0 ? `+${testCoverageDelta}%` : `${testCoverageDelta}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="5"
                    step="0.5"
                    value={testCoverageDelta}
                    onChange={(e) => setTestCoverageDelta(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Coverage Dropped (-10%)</span>
                    <span>Coverage Increased (+5%)</span>
                  </div>
                </div>

                {/* Schema Migration Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Contains Database Schema Migration?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Adds rollback risk for live active database transactions.
                    </p>
                  </div>
                  <button
                    onClick={() => setHasSchemaMigration(!hasSchemaMigration)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      hasSchemaMigration ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                        hasSchemaMigration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Traffic Window */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Target Deployment Time Window
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Off-peak deployments significantly reduce blast radius impact.
                    </p>
                  </div>
                  <select
                    value={trafficWindow}
                    onChange={(e) => setTrafficWindow(e.target.value as any)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <option value="offpeak">Off-Peak (Low Traffic)</option>
                    <option value="normal">Standard Hours</option>
                    <option value="peak">Peak Hours (High Traffic)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ECO-DEPLOY (CARBON FOOTPRINT TRACKER) */}
      {activeTab === 'eco' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    EcoDeploy: Green Software CI/CD Carbon Accounting
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    ISO 14064 Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Automated tracking of compute carbon intensity (g CO₂e) per deployment pipeline and cloud region.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span>Green Score: A+ (94/100)</span>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Carbon Per Build Execution
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">12.4</span>
                  <span className="text-xs font-semibold text-slate-500">g CO₂e / run</span>
                </div>
                <p className="mt-2 text-[11px] text-emerald-700 font-medium">
                  &darr; 42% lower than standard Docker VM builds
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cumulative 30-Day Footprint
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">3.82</span>
                  <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Equivalent to offset by 0.18 mature trees
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Eco-Optimized Build Caching
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-emerald-700">89.2%</span>
                  <span className="text-xs font-semibold text-slate-500">cache hit rate</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Saved 14.8 hours of CPU compilation cycles
                </p>
              </div>
            </div>

            {/* Regional Grid Intensity Comparison Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Cloud Region Grid Carbon Comparison
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Region</th>
                      <th className="px-4 py-2.5">Primary Grid Source</th>
                      <th className="px-4 py-2.5">Grid Carbon Intensity</th>
                      <th className="px-4 py-2.5">DeployFlow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="bg-emerald-50/40">
                      <td className="px-4 py-3 font-semibold text-emerald-950">
                        AWS eu-north-1 (Stockholm)
                      </td>
                      <td className="px-4 py-3 text-slate-600">Hydroelectric &amp; Wind</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        18 g CO₂e / kWh
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success" size="sm">
                          Active Primary Cluster
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        AWS us-east-1 (N. Virginia)
                      </td>
                      <td className="px-4 py-3 text-slate-600">Natural Gas &amp; Coal</td>
                      <td className="px-4 py-3 font-mono text-slate-700">379 g CO₂e / kWh</td>
                      <td className="px-4 py-3 text-slate-500">Secondary Failover</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        AWS ap-south-1 (Mumbai)
                      </td>
                      <td className="px-4 py-3 text-slate-600">Coal Dominated Grid</td>
                      <td className="px-4 py-3 font-mono text-slate-700">624 g CO₂e / kWh</td>
                      <td className="px-4 py-3 text-slate-500">Edge Gateway Cache</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHAOS & SELF-HEALING SIMULATOR */}
      {activeTab === 'chaos' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Interactive Chaos Engineering Playground
                </h2>
                <p className="text-xs text-slate-500">
                  Inject intentional system failures to demonstrate DeployFlow's autonomous self-healing, quota guards, and fast recovery in live evaluation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Current Health:</span>
                <Badge
                  variant={
                    chaosState.status === 'Nominal' || chaosState.status === 'Recovered'
                      ? 'success'
                      : chaosState.status === 'Healing'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                  dot
                >
                  {chaosState.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Live Metrics Telemetry Panel */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  P99 Gateway Latency
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      chaosState.latency > 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                    }`}
                  >
                    {chaosState.latency}
                  </span>
                  <span className="text-xs text-slate-500">ms</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Target SLA: &lt; 50ms</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  HTTP Error Rate
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      chaosState.errorRate > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {chaosState.errorRate}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Error Budget Burn: Normal</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Autonomous Self-Heal MTTR
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-emerald-700">1.4s</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Automated Rollback Engine Ready</p>
              </div>
            </div>

            {/* Live Status Message Box */}
            <div
              className={`rounded-xl border p-4 text-xs font-mono transition-all ${
                chaosState.status === 'Degraded'
                  ? 'border-rose-300 bg-rose-50 text-rose-900'
                  : chaosState.status === 'Healing'
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-900 text-emerald-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 shrink-0" />
                <span>{chaosState.activeIncidentText}</span>
              </div>
            </div>

            {/* Interactive Chaos Trigger Buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Live Chaos Trigger Actions (Click to Test)
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => triggerChaos('latency')}
                  className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/50"
                >
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs">
                    <Activity className="h-4 w-4" />
                    <span>Latency Spike</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Injects +800ms artificial network delay to test degradation alerts.
                  </p>
                </button>

                <button
                  onClick={() => triggerChaos('oom')}
                  className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-rose-300 hover:bg-rose-50/50"
                >
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
                    <Flame className="h-4 w-4" />
                    <span>Memory OOM Crash</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Simulates pod heap exhaustion and triggers container restart.
                  </p>
                </button>

                <button
                  onClick={() => triggerChaos('quota')}
                  className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-purple-300 hover:bg-purple-50/50"
                >
                  <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                    <Zap className="h-4 w-4" />
                    <span>HTTP 429 Quota Breach</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tests tenant quota enforcement and rate-limiting response.
                  </p>
                </button>

                <button
                  onClick={() => triggerChaos('rollback')}
                  className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                    <RotateCcw className="h-4 w-4" />
                    <span>Instant Auto-Rollback</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Triggers 1.4-second automated rollback to last verified clean SHA.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiOpsPage;

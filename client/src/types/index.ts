export type PlanType = 'free' | 'pro' | 'enterprise';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  subscriptionStatus: string;
  role?: MemberRole;
  currentUserRole?: MemberRole;
  ownerId?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  role: MemberRole;
  invitedAt: string;
  acceptedAt?: string;
  status: 'active' | 'pending';
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  priceMonthly: number;
  quotas: {
    deployments: number;
    team_members: number;
    api_calls: number;
    build_minutes: number;
  };
  features: string[];
  popular?: boolean;
}

export interface SubscriptionInfo {
  subscription: {
    id: string;
    plan: PlanType;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  planDetails: PlanConfig;
  billingMode: string;
}

export interface UsageMetricDetail {
  metric: string;
  current: number;
  limit: number;
  percentage: number;
  exceeded: boolean;
}

export interface UsageSummary {
  plan: PlanType;
  periodStart: string;
  metrics: {
    deployments: UsageMetricDetail;
    api_calls: UsageMetricDetail;
    build_minutes: UsageMetricDetail;
    team_members: UsageMetricDetail;
  };
}

export interface FeatureFlag {
  _id: string;
  key: string;
  description: string;
  enabledForPlans: PlanType[];
  rolloutPct: number;
  enabled: boolean;
}

export interface SystemHealth {
  status: string;
  database: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  cpus: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  metrics: {
    totalUsers: number;
    totalOrganisations: number;
    totalDeploymentsRecorded: number;
  };
}

export interface ProjectEnvVar {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface ProjectAnalytics {
  totalRequests: number;
  avgResponseTimeMs: number;
  bandwidthBytes: number;
  lastRequestAt?: string;
  statusCodes?: Record<string, number>;
}

export interface ProjectDeployment {
  _id?: string;
  deploymentId: string;
  commit: string;
  message: string;
  branch: string;
  status: string;
  duration: string;
  environment: string;
  sender: string;
  liveUrl?: string;
  buildLogs: string[];
  deployedFiles: string[];
  fileCount: number;
  bundleSize: string;
  isCurrentLive: boolean;
  createdAt: string;
}

export interface CustomDomain {
  domain: string;
  status: 'verified' | 'pending' | 'failed';
  sslStatus: 'active' | 'issuing' | 'expired';
  cnameRecord: string;
  verifiedAt?: string;
}

export interface Project {
  _id: string;
  id?: string;
  organisation: string;
  name: string;
  slug: string;
  description?: string;
  framework: 'static' | 'react' | 'vue' | 'node' | 'html';
  sourceType: 'template' | 'upload' | 'git' | 'code';
  templateId?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  buildCommand?: string;
  outputDir?: string;
  envVars: ProjectEnvVar[];
  customDomains?: CustomDomain[];
  activeDeployment?: ProjectDeployment;
  liveUrl: string;
  analytics: ProjectAnalytics;
  status: 'active' | 'deploying' | 'failed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  framework: 'static' | 'react' | 'html';
  badge: string;
  fileCount: number;
}

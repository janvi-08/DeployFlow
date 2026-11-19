import { PlanType } from '../models/Organisation.js';
import { UsageMetric } from '../models/UsageRecord.js';

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  priceMonthly: number;
  quotas: Record<UsageMetric, number>;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    description: 'Perfect for side projects, hobbyists, and evaluating DeployFlow.',
    priceMonthly: 0,
    quotas: {
      deployments: 20,
      team_members: 3,
      api_calls: 1000,
      build_minutes: 100,
    },
    features: [
      'Up to 3 team members',
      '20 automated deployments / month',
      '1,000 API calls / month',
      'Community Discord support',
      'Standard pipeline execution',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    description: 'For growing teams requiring scalable CI/CD pipelines and team controls.',
    priceMonthly: 29,
    popular: true,
    quotas: {
      deployments: 250,
      team_members: 15,
      api_calls: 50000,
      build_minutes: 1000,
    },
    features: [
      'Up to 15 team members',
      '250 automated deployments / month',
      '50,000 API calls / month',
      'Role-based access control (RBAC)',
      'Concurrent build runners',
      'Slack & Discord webhooks',
      'Email & ticket priority support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Scale',
    description: 'Mission-critical delivery for organizations needing custom scale and compliance.',
    priceMonthly: 99,
    quotas: {
      deployments: 5000,
      team_members: 100,
      api_calls: 1000000,
      build_minutes: 10000,
    },
    features: [
      'Unlimited / 100 team seats',
      '5,000 deployments / month',
      '1,000,000 API calls / month',
      'Dedicated runner fleet',
      'Enterprise audit logging',
      '99.95% uptime SLA',
      'Dedicated technical account manager',
    ],
  },
};

import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { User } from './models/User.js';
import { Organisation } from './models/Organisation.js';
import { Membership } from './models/Membership.js';
import { Subscription } from './models/Subscription.js';
import { UsageRecord } from './models/UsageRecord.js';
import { FeatureFlag } from './models/FeatureFlag.js';
import { Project } from './models/Project.js';
import { DeploymentEngine } from './services/deploymentEngine.js';
import { hashPassword } from './utils/password.js';

async function bootstrap() {
  try {
    await connectDB();

    // 1. Bootstrap initial System Admin if not already existing
    let adminUser = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (!adminUser) {
      const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
      adminUser = await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: 'admin',
        emailVerified: true,
      });
      logger.info(`Bootstrap: Created default system admin (${env.ADMIN_EMAIL})`);
    }

    // Ensure Admin has a primary organisation
    const adminOrgExists = await Organisation.findOne({ ownerId: adminUser._id });
    if (!adminOrgExists) {
      const adminOrg = await Organisation.create({
        name: 'Platform Operations',
        slug: 'platform-operations',
        ownerId: adminUser._id,
        plan: 'enterprise',
        subscriptionStatus: 'active',
      });

      await Membership.create({
        orgId: adminOrg._id,
        userId: adminUser._id,
        role: 'owner',
        acceptedAt: new Date(),
      });

      await Subscription.create({
        orgId: adminOrg._id,
        plan: 'enterprise',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      logger.info('Bootstrap: Seeded admin organisation (Platform Operations)');
    }

    // 2. Bootstrap Standard Developer user (test@deployflow.io)
    const demoEmail = 'test@deployflow.io';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      const demoPassHash = await hashPassword('SecurePassword123!');
      demoUser = await User.create({
        name: 'Alex Developer',
        email: demoEmail,
        passwordHash: demoPassHash,
        role: 'user',
        emailVerified: true,
      });
      logger.info(`Bootstrap: Created demo standard developer (${demoEmail})`);
    }

    // Ensure Demo Developer has an organisation (Acme Engineering)
    const demoOrgExists = await Organisation.findOne({ ownerId: demoUser._id });
    if (!demoOrgExists) {
      const demoOrg = await Organisation.create({
        name: 'Acme Engineering',
        slug: 'acme-engineering',
        ownerId: demoUser._id,
        plan: 'pro',
        subscriptionStatus: 'active',
      });

      await Membership.create({
        orgId: demoOrg._id,
        userId: demoUser._id,
        role: 'owner',
        acceptedAt: new Date(),
      });

      await Subscription.create({
        orgId: demoOrg._id,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      await UsageRecord.create([
        { orgId: demoOrg._id, metric: 'deployments', quantity: 6, periodStart },
        { orgId: demoOrg._id, metric: 'api_calls', quantity: 1850, periodStart },
        { orgId: demoOrg._id, metric: 'build_minutes', quantity: 42, periodStart },
        { orgId: demoOrg._id, metric: 'team_members', quantity: 1, periodStart },
      ]);

      logger.info('Bootstrap: Seeded demo organisation (Acme Engineering) with initial usage');
    }

    // Ensure Demo Developer has colleagues in Acme Engineering for rich team management
    const demoOrgForTeam = await Organisation.findOne({ slug: 'acme-engineering' });
    if (demoOrgForTeam) {
      const colleagueEmail = 'sarah.engineer@acme.io';
      let colleagueUser = await User.findOne({ email: colleagueEmail });
      if (!colleagueUser) {
        const colleaguePassHash = await hashPassword('SecurePass123!');
        colleagueUser = await User.create({
          name: 'Sarah Chen',
          email: colleagueEmail,
          passwordHash: colleaguePassHash,
          role: 'user',
          emailVerified: true,
        });
      }

      const colleagueMemberExists = await Membership.findOne({
        orgId: demoOrgForTeam._id,
        userId: colleagueUser._id,
      });

      if (!colleagueMemberExists) {
        await Membership.create({
          orgId: demoOrgForTeam._id,
          userId: colleagueUser._id,
          role: 'member',
          acceptedAt: new Date(),
        });
        await Membership.create({
          orgId: demoOrgForTeam._id,
          role: 'member',
          invitedEmail: 'marcus.devops@acme.io',
          invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        });
        logger.info('Bootstrap: Seeded team members for Acme Engineering');
      }

      // Seed starter live deployed projects for demoOrgForTeam
      const projectCount = await Project.countDocuments({ organisation: demoOrgForTeam._id });
      if (projectCount === 0) {
        try {
          const portfolioProj = await Project.create({
            organisation: demoOrgForTeam._id,
            name: 'Acme Developer Portfolio',
            slug: 'acme-portfolio',
            description: 'Modern full-stack engineer portfolio with interactive dark/light theme and skills radar.',
            framework: 'static',
            sourceType: 'template',
            templateId: 'portfolio',
            liveUrl: '/sites/acme-portfolio',
            status: 'active',
            envVars: [
              { key: 'NODE_ENV', value: 'production', isSecret: false },
              { key: 'API_ENDPOINT', value: 'https://api.deployflow.io', isSecret: false },
            ],
          });
          await DeploymentEngine.executeDeployment(portfolioProj, {
            sourceType: 'template',
            templateId: 'portfolio',
            commitMsg: 'Initial portfolio template deployment',
            senderEmail: demoEmail,
          });

          const pulseProj = await Project.create({
            organisation: demoOrgForTeam._id,
            name: 'PulseAI SRE Observability',
            slug: 'pulse-ai',
            description: 'High-converting SaaS landing page with pricing calculator and live telemetry stream.',
            framework: 'static',
            sourceType: 'template',
            templateId: 'saas-landing',
            liveUrl: '/sites/pulse-ai',
            status: 'active',
            envVars: [
              { key: 'OBSERVABILITY_KEY', value: 'sre_live_89a19c', isSecret: true },
            ],
          });
          await DeploymentEngine.executeDeployment(pulseProj, {
            sourceType: 'template',
            templateId: 'saas-landing',
            commitMsg: 'Production launch of PulseAI landing page',
            senderEmail: demoEmail,
          });

          const metricsProj = await Project.create({
            organisation: demoOrgForTeam._id,
            name: 'CloudControl Metrics SPA',
            slug: 'cloud-control',
            description: 'Interactive dashboard SPA with stateful counters and live edge HTTP ping latency probe.',
            framework: 'react',
            sourceType: 'template',
            templateId: 'react-metrics',
            liveUrl: '/sites/cloud-control',
            status: 'active',
            envVars: [],
          });
          await DeploymentEngine.executeDeployment(metricsProj, {
            sourceType: 'template',
            templateId: 'react-metrics',
            commitMsg: 'Deploy CloudControl metrics dashboard',
            senderEmail: demoEmail,
          });

          logger.info('Bootstrap: Seeded initial live deployed applications (Portfolio, PulseAI, CloudControl)');
        } catch (projSeedErr) {
          logger.warn({ projSeedErr }, 'Bootstrap: Note on project seeding');
        }
      }
    }

    // 3. Seed default feature flags if none exist
    const flagCount = await FeatureFlag.countDocuments();
    if (flagCount === 0) {
      await FeatureFlag.create([
        {
          key: 'canary_deployments',
          description: 'Enable canary deployment rollout strategies for CI/CD pipelines',
          enabledForPlans: ['pro', 'enterprise'],
          rolloutPct: 100,
          enabled: true,
        },
        {
          key: 'ai_build_analyzer',
          description: 'Automatic AI root-cause analysis for failed deployment logs',
          enabledForPlans: ['enterprise'],
          rolloutPct: 50,
          enabled: false,
        },
        {
          key: 'multi_region_clusters',
          description: 'Deploy workloads simultaneously to multi-region Kubernetes clusters',
          enabledForPlans: ['enterprise'],
          rolloutPct: 100,
          enabled: true,
        },
      ]);
      logger.info('Bootstrap: Seeded initial feature flags');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`DeployFlow Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${env.PORT}/healthz`);
      logger.info(`Readiness check: http://localhost:${env.PORT}/readyz`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use. Stop the existing DeployFlow server or free the port before restarting.`);
        logger.error('Common fix: taskkill /F /PID <node-process-id> or close the stale dev session.');
        process.exit(1);
      }

      logger.error({ error }, 'Server failed to start');
      process.exit(1);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Failed to start DeployFlow server');
    process.exit(1);
  }
}

bootstrap();

import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Organisation } from '../src/models/Organisation.js';
import { Membership } from '../src/models/Membership.js';
import { Subscription } from '../src/models/Subscription.js';
import { UsageRecord } from '../src/models/UsageRecord.js';
import { hashPassword } from '../src/utils/password.js';

describe('DeployFlow Core API Test Suite', () => {
  let authToken = '';
  let authCookie = '';
  let testUserId = '';
  let testOrgId = '';
  const testUserEmail = `test_${Date.now()}@deployflow.io`;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    // Cleanup created test data
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await Organisation.deleteMany({ ownerId: testUserId });
      await Membership.deleteMany({ userId: testUserId });
      if (testOrgId) {
        await Subscription.deleteMany({ orgId: testOrgId });
        await UsageRecord.deleteMany({ orgId: testOrgId });
      }
    }
    await disconnectDB();
  });

  describe('1. Health and Readiness Probes', () => {
    it('GET /healthz should return 200 OK with uptime and status', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.uptime).toBe('number');
    });

    it('GET /readyz should return 200 OK when database is connected', async () => {
      const res = await request(app).get('/readyz');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Authentication Workflows', () => {
    it('POST /api/auth/register should create a user and return cookie/token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Developer',
          email: testUserEmail,
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
      expect(res.body.data.token).toBeDefined();

      authToken = res.body.data.token;
      testUserId = res.body.data.user.id;

      // Extract set-cookie header
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        authCookie = cookies[0];
      }
    });

    it('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Jane',
          email: testUserEmail,
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should authenticate with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject incorrect password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
    });

    it('GET /api/auth/me should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Organisation and Team Management', () => {
    it('POST /api/orgs should create a new organisation and assign Owner role', async () => {
      const res = await request(app)
        .post('/api/orgs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Acme Cloud Services',
          slug: `acme-cloud-${Date.now()}`,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Acme Cloud Services');
      expect(res.body.data.role).toBe('owner');
      expect(res.body.data.plan).toBe('free');

      testOrgId = res.body.data.id;
    });

    it('GET /api/orgs should list all organisations accessible to the user', async () => {
      const res = await request(app)
        .get('/api/orgs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((o: any) => o.id === testOrgId);
      expect(found).toBeDefined();
    });

    it('GET /api/orgs/:id should return organisation details', async () => {
      const res = await request(app)
        .get(`/api/orgs/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Acme Cloud Services');
      expect(res.body.data.currentUserRole).toBe('owner');
    });

    it('GET /api/orgs/:id/members should list members including owner', async () => {
      const res = await request(app)
        .get(`/api/orgs/${testOrgId}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].role).toBe('owner');
    });

    it('POST /api/orgs/:id/invites should allow owner to invite team member', async () => {
      const res = await request(app)
        .post(`/api/orgs/${testOrgId}/invites`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'colleague@acme.io',
          role: 'member',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('colleague@acme.io');
    });
  });

  describe('4. Billing & Quota Enforcement', () => {
    it('GET /api/billing/plans should return Free, Pro, and Enterprise tiers', async () => {
      const res = await request(app).get('/api/billing/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      const planIds = res.body.data.map((p: any) => p.id);
      expect(planIds).toContain('free');
      expect(planIds).toContain('pro');
      expect(planIds).toContain('enterprise');
    });

    it('GET /api/billing/subscription should return current subscription', async () => {
      const res = await request(app)
        .get('/api/billing/subscription')
        .query({ orgId: testOrgId })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.subscription.plan).toBe('free');
    });

    it('POST /api/usage/simulate-deployment should execute deployment and consume quota', async () => {
      const res = await request(app)
        .post('/api/usage/simulate-deployment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orgId: testOrgId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metric).toBe('deployments');
      expect(res.body.data.currentUsage).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/billing/change-plan should switch plan tier in development mode', async () => {
      const res = await request(app)
        .post('/api/billing/change-plan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: testOrgId,
          plan: 'pro',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('pro');
    });
  });

  describe('5. RBAC and Admin Restrictions', () => {
    it('GET /api/admin/orgs should reject standard non-admin user with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/orgs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Real Project Deployment, Live Edge Serving & Rollback', () => {
    let createdProjectId = '';
    let createdProjectSlug = '';
    let firstDeploymentId = '';
    let secondDeploymentId = '';

    it('GET /api/projects/templates should return ready-to-deploy templates catalog', async () => {
      const res = await request(app).get('/api/projects/templates');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const templateIds = res.body.data.map((t: any) => t.id);
      expect(templateIds).toContain('portfolio');
      expect(templateIds).toContain('saas-landing');
    });

    it('POST /api/projects should create and deploy a live project from template', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: testOrgId,
          name: 'Portfolio Alpha',
          sourceType: 'template',
          templateId: 'portfolio',
          framework: 'static',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project).toBeDefined();
      expect(res.body.data.deployment).toBeDefined();

      createdProjectId = res.body.data.project._id;
      createdProjectSlug = res.body.data.project.slug;
      firstDeploymentId = res.body.data.deployment.deploymentId;

      expect(createdProjectSlug).toBeDefined();
      expect(res.body.data.deployment.status).toBe('Active');
      expect(res.body.data.deployment.deployedFiles.length).toBeGreaterThan(0);
    });

    it('GET /sites/:projectSlug should serve live HTML with DeployFlow Edge Badge', async () => {
      const res = await request(app).get(`/sites/${createdProjectSlug}`);
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/html');
      expect(res.header['x-served-by']).toBe('DeployFlow Edge Proxy');
      expect(res.text).toContain('Deployed on');
      expect(res.text).toContain('DeployFlow');
    });

    it('POST /api/projects/:id/deploy should deploy custom code snippet', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProjectId}/deploy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: testOrgId,
          sourceType: 'code',
          codeSnippet: {
            html: '<!DOCTYPE html><html><body><h1>Version 2 Custom Code</h1></body></html>',
            css: 'body { background: #111; color: #fff; }',
            js: 'console.log("v2 live");',
          },
          commitMsg: 'Deploy custom snippet update',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      secondDeploymentId = res.body.data.deploymentId;
      expect(secondDeploymentId).not.toBe(firstDeploymentId);

      // Verify live site now serves version 2
      const siteRes = await request(app).get(`/sites/${createdProjectSlug}`);
      expect(siteRes.status).toBe(200);
      expect(siteRes.text).toContain('Version 2 Custom Code');
    });

    it('POST /api/projects/:id/rollback/:deploymentId should instantly roll back to first deployment', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProjectId}/rollback/${firstDeploymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orgId: testOrgId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify site reverted to first deployment (portfolio template)
      const siteRes = await request(app).get(`/sites/${createdProjectSlug}`);
      expect(siteRes.status).toBe(200);
      expect(siteRes.text).toContain('Alex Morgan');
    });

    it('GET /api/projects/:id/analytics should reflect real served requests', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: testOrgId });

      expect(res.status).toBe(200);
      expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(1);
    });
  });
});

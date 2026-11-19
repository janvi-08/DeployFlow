import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  deployProject,
  rollbackProject,
  getProjectAnalytics,
  getTemplates,
  getDeployment,
  streamDeploymentLogs,
  addCustomDomain,
  removeCustomDomain,
  testEdgeFunction,
} from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveProjectAndOrg } from '../middleware/projectAuth.js';

export const projectRouter = Router();

// Public / auth-free templates catalogue
projectRouter.get('/templates', getTemplates);

// Real-time SSE logs stream (can be opened by browser EventSource)
projectRouter.get('/deployments/:deploymentId/logs-stream', streamDeploymentLogs);
projectRouter.get('/deployments/:deploymentId', getDeployment);

// All project management endpoints require user authentication & org context
projectRouter.use(requireAuth);
projectRouter.use(resolveProjectAndOrg);

projectRouter.get('/', listProjects);
projectRouter.post('/', createProject);
projectRouter.get('/:id', getProject);
projectRouter.patch('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);
projectRouter.post('/:id/deploy', deployProject);
projectRouter.post('/:id/rollback/:deploymentId', rollbackProject);
projectRouter.get('/:id/analytics', getProjectAnalytics);
projectRouter.post('/:id/domains', addCustomDomain);
projectRouter.delete('/:id/domains/:domain', removeCustomDomain);
projectRouter.post('/:id/edge-test', testEdgeFunction);

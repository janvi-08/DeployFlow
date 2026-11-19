import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  User,
  Organisation,
  TeamMember,
  PlanConfig,
  SubscriptionInfo,
  UsageSummary,
  FeatureFlag,
  SystemHealth,
  Project,
  ProjectDeployment,
  ProjectTemplate,
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: [
    'Auth',
    'Orgs',
    'Members',
    'Subscription',
    'Usage',
    'Deployments',
    'Projects',
    'ProjectDetails',
    'AdminFlags',
    'AdminOrgs',
    'AdminHealth',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    register: builder.mutation<{ success: boolean; data: { user: User; token: string; organisations?: Organisation[] } }, any>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<{ success: boolean; data: { user: User; token: string; organisations?: Organisation[] } }, any>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Orgs'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Orgs'],
    }),
    getMe: builder.query<{ success: boolean; data: { user: User; organisations: Organisation[] } }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string; data?: any }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, { token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // Organisation endpoints
    getOrgs: builder.query<{ success: boolean; data: Organisation[] }, void>({
      query: () => '/orgs',
      providesTags: ['Orgs'],
    }),
    createOrg: builder.mutation<{ success: boolean; data: Organisation }, { name: string; slug?: string }>({
      query: (body) => ({
        url: '/orgs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orgs'],
    }),
    getOrg: builder.query<{ success: boolean; data: Organisation }, string>({
      query: (id) => `/orgs/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Orgs', id }],
    }),
    updateOrg: builder.mutation<{ success: boolean; data: Organisation }, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/orgs/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: ['Orgs'],
    }),

    // Team endpoints
    getMembers: builder.query<{ success: boolean; data: TeamMember[] }, string>({
      query: (orgId) => `/orgs/${orgId}/members`,
      providesTags: ['Members'],
    }),
    inviteMember: builder.mutation<
      { success: boolean; data: any; message: string },
      { orgId: string; email: string; role: 'admin' | 'member' }
    >({
      query: ({ orgId, email, role }) => ({
        url: `/orgs/${orgId}/invites`,
        method: 'POST',
        body: { email, role },
      }),
      invalidatesTags: ['Members', 'Usage'],
    }),
    updateMemberRole: builder.mutation<
      { success: boolean; data: any },
      { orgId: string; userId: string; role: 'admin' | 'member' }
    >({
      query: ({ orgId, userId, role }) => ({
        url: `/orgs/${orgId}/members/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Members'],
    }),
    removeMember: builder.mutation<{ success: boolean; message: string }, { orgId: string; userId: string }>({
      query: ({ orgId, userId }) => ({
        url: `/orgs/${orgId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Members', 'Usage'],
    }),

    // Billing endpoints
    getPlans: builder.query<{ success: boolean; data: PlanConfig[] }, void>({
      query: () => '/billing/plans',
    }),
    getSubscription: builder.query<{ success: boolean; data: SubscriptionInfo }, string>({
      query: (orgId) => `/billing/subscription?orgId=${orgId}`,
      providesTags: ['Subscription'],
    }),
    changePlan: builder.mutation<
      { success: boolean; data: any; message: string },
      { orgId: string; plan: 'free' | 'pro' | 'enterprise' }
    >({
      query: (body) => ({
        url: '/billing/change-plan',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Orgs', 'Usage'],
    }),

    // Usage & Quota endpoints
    getUsage: builder.query<{ success: boolean; data: UsageSummary }, string>({
      query: (orgId) => `/usage?orgId=${orgId}`,
      providesTags: ['Usage'],
    }),
    simulateDeployment: builder.mutation<{ success: boolean; data?: any; message?: string }, { orgId: string }>({
      query: ({ orgId }) => ({
        url: '/usage/simulate-deployment',
        method: 'POST',
        body: { orgId },
      }),
      invalidatesTags: ['Usage', 'Deployments'],
    }),
    simulateApiCalls: builder.mutation<{ success: boolean; data?: any; message?: string }, { orgId: string; count?: number }>({
      query: ({ orgId, count = 25 }) => ({
        url: '/usage/simulate-api',
        method: 'POST',
        body: { orgId, count },
      }),
      invalidatesTags: ['Usage'],
    }),
    triggerGithubWebhook: builder.mutation<
      { success: boolean; data?: any; message?: string },
      { orgId: string; commit?: string; message?: string; branch?: string; repository?: string }
    >({
      query: (body) => ({
        url: '/webhooks/github',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Usage', 'Deployments'],
    }),
    sendApiTelemetry: builder.mutation<
      { success: boolean; data?: any; message?: string },
      { orgId: string; count?: number; apiKey?: string }
    >({
      query: (body) => ({
        url: '/telemetry/api-call',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Usage'],
    }),
    getDeployments: builder.query<{ success: boolean; data: any[] }, string>({
      query: (orgId) => `/webhooks/deployments?orgId=${orgId}`,
      providesTags: ['Deployments'],
    }),

    // Real Projects & Live Deployment Endpoints
    getProjects: builder.query<{ success: boolean; data: Project[] }, string>({
      query: (orgId) => `/projects?orgId=${orgId}`,
      providesTags: ['Projects'],
    }),
    getProject: builder.query<{ success: boolean; data: { project: Project; deployments: ProjectDeployment[] } }, { id: string; orgId?: string }>({
      query: ({ id, orgId }) => `/projects/${id}?orgId=${orgId || ''}`,
      providesTags: (_res, _err, { id }) => [{ type: 'ProjectDetails', id }, 'Projects'],
    }),
    createProject: builder.mutation<{ success: boolean; data: { project: Project; deployment: ProjectDeployment } }, any>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects', 'Usage', 'Deployments'],
    }),
    deployProject: builder.mutation<{ success: boolean; data: ProjectDeployment }, { id: string; orgId?: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}/deploy`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects', 'ProjectDetails', 'Usage', 'Deployments'],
    }),
    rollbackProject: builder.mutation<{ success: boolean; data: ProjectDeployment }, { id: string; deploymentId: string; orgId?: string }>({
      query: ({ id, deploymentId, orgId }) => ({
        url: `/projects/${id}/rollback/${deploymentId}`,
        method: 'POST',
        body: { orgId },
      }),
      invalidatesTags: ['Projects', 'ProjectDetails', 'Deployments'],
    }),
    updateProject: builder.mutation<{ success: boolean; data: Project }, { id: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Projects', 'ProjectDetails'],
    }),
    deleteProject: builder.mutation<{ success: boolean }, { id: string; orgId?: string }>({
      query: ({ id, orgId }) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
        params: { orgId },
      }),
      invalidatesTags: ['Projects', 'Usage'],
    }),
    getTemplates: builder.query<{ success: boolean; data: ProjectTemplate[] }, void>({
      query: () => '/projects/templates',
    }),
    getProjectDeployment: builder.query<{ success: boolean; data: ProjectDeployment }, string>({
      query: (deploymentId) => `/projects/deployments/${deploymentId}`,
    }),
    getProjectAnalytics: builder.query<{ success: boolean; data: any }, { id: string; orgId?: string }>({
      query: ({ id, orgId }) => `/projects/${id}/analytics?orgId=${orgId || ''}`,
    }),
    addCustomDomain: builder.mutation<{ success: boolean; data: any; message: string }, { id: string; domain: string; orgId?: string }>({
      query: ({ id, domain, orgId }) => ({
        url: `/projects/${id}/domains`,
        method: 'POST',
        body: { domain, orgId },
      }),
      invalidatesTags: ['ProjectDetails'],
    }),
    removeCustomDomain: builder.mutation<{ success: boolean; data: any; message: string }, { id: string; domain: string; orgId?: string }>({
      query: ({ id, domain, orgId }) => ({
        url: `/projects/${id}/domains/${domain}`,
        method: 'DELETE',
        params: { orgId },
      }),
      invalidatesTags: ['ProjectDetails'],
    }),
    testEdgeFunction: builder.mutation<{ success: boolean; data: any; message: string }, { id: string; route?: string; method?: string; payload?: any; orgId?: string }>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}/edge-test`,
        method: 'POST',
        body,
      }),
    }),

    // Admin endpoints
    getAdminOrgs: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/admin/orgs',
      providesTags: ['AdminOrgs'],
    }),
    getAdminSubscriptions: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/admin/subscriptions',
    }),
    getFeatureFlags: builder.query<{ success: boolean; data: FeatureFlag[] }, void>({
      query: () => '/admin/feature-flags',
      providesTags: ['AdminFlags'],
    }),
    updateFeatureFlag: builder.mutation<{ success: boolean; data: FeatureFlag }, Partial<FeatureFlag> & { key: string }>({
      query: ({ key, ...body }) => ({
        url: `/admin/feature-flags/${key}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminFlags'],
    }),
    getAdminHealth: builder.query<{ success: boolean; data: SystemHealth }, void>({
      query: () => '/admin/health',
      providesTags: ['AdminHealth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetOrgsQuery,
  useCreateOrgMutation,
  useGetOrgQuery,
  useUpdateOrgMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useChangePlanMutation,
  useGetUsageQuery,
  useSimulateDeploymentMutation,
  useSimulateApiCallsMutation,
  useTriggerGithubWebhookMutation,
  useSendApiTelemetryMutation,
  useGetDeploymentsQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useDeployProjectMutation,
  useRollbackProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTemplatesQuery,
  useGetProjectDeploymentQuery,
  useGetProjectAnalyticsQuery,
  useAddCustomDomainMutation,
  useRemoveCustomDomainMutation,
  useTestEdgeFunctionMutation,
  useGetAdminOrgsQuery,
  useGetAdminSubscriptionsQuery,
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
  useGetAdminHealthQuery,
} = api;

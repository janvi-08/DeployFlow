import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './features/store';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LoginPage } from './pages/public/LoginPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Dashboard Pages
import { OverviewDashboard } from './pages/dashboard/OverviewDashboard';
import { ProjectsPage } from './pages/dashboard/ProjectsPage';
import { ProjectDetailsPage } from './pages/dashboard/ProjectDetailsPage';
import { ArchitectureVivaPage } from './pages/dashboard/ArchitectureVivaPage';
import { TeamManagementPage } from './pages/dashboard/TeamManagementPage';
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage';
import { UsageAnalyticsPage } from './pages/dashboard/UsageAnalyticsPage';
import { OrgSettingsPage } from './pages/dashboard/OrgSettingsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { AiOpsPage } from './pages/dashboard/AiOpsPage';

// Admin Pages
import { AdminOrgsPage } from './pages/admin/AdminOrgsPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminFeatureFlagsPage } from './pages/admin/AdminFeatureFlagsPage';
import { AdminHealthPage } from './pages/admin/AdminHealthPage';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Authenticated Dashboard Pages */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewDashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="architecture" element={<ArchitectureVivaPage />} />
            <Route path="team" element={<TeamManagementPage />} />
            <Route path="billing" element={<SubscriptionPage />} />
            <Route path="usage" element={<UsageAnalyticsPage />} />
            <Route path="ai-ops" element={<AiOpsPage />} />
            <Route path="settings" element={<OrgSettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Platform Pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/orgs" replace />} />
            <Route path="orgs" element={<AdminOrgsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="feature-flags" element={<AdminFeatureFlagsPage />} />
            <Route path="health" element={<AdminHealthPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

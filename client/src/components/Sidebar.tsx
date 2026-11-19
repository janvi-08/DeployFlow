import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  ShieldAlert,
  LogOut,
  ChevronDown,
  PlusCircle,
  Building2,
  Server,
  Layers,
  Flag,
  Sparkles,
  Rocket,
  BookOpen,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import { setActiveOrgId, clearAuth } from '../features/authSlice';
import { useLogoutMutation, useGetOrgsQuery } from '../services/api';
import { CreateOrgModal } from './CreateOrgModal';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, activeOrgId } = useSelector(
    (state: RootState) => state.auth
  );

  const { data: orgsData } = useGetOrgsQuery();
  const [logoutTrigger] = useLogoutMutation();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  const orgs = orgsData?.data || [];
  const currentOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  const handleSelectOrg = (orgId: string) => {
    dispatch(setActiveOrgId(orgId));
    setIsOrgDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
    } catch (e) {
      // Clear local authentication even if the request fails.
    } finally {
      dispatch(clearAuth());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects & Deployments', to: '/dashboard/projects', icon: Rocket, badge: 'Live' },
    { name: 'Architecture & Viva', to: '/dashboard/architecture', icon: BookOpen, badge: 'Placement' },
    { name: 'AI Ops & SRE', to: '/dashboard/ai-ops', icon: Sparkles, badge: 'Unique' },
    { name: 'Team & RBAC', to: '/dashboard/team', icon: Users },
    { name: 'Subscription', to: '/dashboard/billing', icon: CreditCard },
    { name: 'Usage Analytics', to: '/dashboard/usage', icon: BarChart3 },
    { name: 'Org Settings', to: '/dashboard/settings', icon: Settings },
    { name: 'Profile & Security', to: '/dashboard/profile', icon: UserCheck },
  ];

  const adminItems = [
    { name: 'All Organisations', to: '/admin/orgs', icon: Building2 },
    { name: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
    { name: 'Feature Flags', to: '/admin/feature-flags', icon: Flag },
    { name: 'System Health', to: '/admin/health', icon: Server },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 select-none flex-col border-r border-slate-200 bg-white text-slate-700">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>

            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                DeployFlow
              </span>
              <span className="block text-[10px] font-medium text-slate-500">
                Team &amp; platform management
              </span>
            </div>
          </NavLink>
        </div>

        {/* Organisation selector */}
        <div className="relative border-b border-slate-200 p-3">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            aria-expanded={isOrgDropdownOpen}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-emerald-200 hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-xs font-bold uppercase text-emerald-800">
                {currentOrg ? currentOrg.name.charAt(0) : 'O'}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {currentOrg ? currentOrg.name : 'Select Workspace'}
                </p>
                <p className="truncate text-[10px] capitalize text-slate-500">
                  {currentOrg
                    ? `${currentOrg.plan} plan · ${currentOrg.role || 'member'}`
                    : 'No active workspace'}
                </p>
              </div>
            </div>

            <ChevronDown
              className={`ml-1 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${
                isOrgDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute left-3 right-3 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Workspaces ({orgs.length})
              </div>

              <div className="max-h-48 overflow-y-auto">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-50 ${
                      org.id === currentOrg?.id
                        ? 'bg-emerald-50 font-semibold text-emerald-800'
                        : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] uppercase text-slate-500">
                      {org.plan}
                    </span>
                  </button>
                ))}

                {orgs.length === 0 && (
                  <p className="px-3 py-3 text-xs text-slate-500">
                    No organisations available.
                  </p>
                )}
              </div>

              <div className="mt-1 border-t border-slate-100 px-1 pt-1.5">
                <button
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    setIsCreateOrgModalOpen(true);
                  }}
                  className="flex w-full items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Organisation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main navigation */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`h-4 w-4 flex-shrink-0 ${
                            isActive
                              ? 'text-emerald-700'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        {'badge' in item && item.badge && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Admin navigation */}
          {user?.role === 'admin' && (
            <div>
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Administration
                </p>
                <ShieldAlert className="h-3.5 w-3.5 text-emerald-700" />
              </div>

              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Current user */}
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {user?.name || 'Developer'}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Create organisation modal */}
      <CreateOrgModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
        onSuccess={(newId) => handleSelectOrg(newId)}
      />
    </>
  );
};
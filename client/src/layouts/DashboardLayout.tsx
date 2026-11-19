import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import { useGetMeQuery, useGetOrgsQuery } from '../services/api';
import { setCredentials, setOrganisations } from '../features/authSlice';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Building2, ArrowRight } from 'lucide-react';
import { CreateOrgModal } from '../components/CreateOrgModal';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, organisations } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    data: meData,
    isLoading: isMeLoading,
    isError: isMeError,
  } = useGetMeQuery(undefined, {
    skip: isAuthenticated,
  });

  const { data: orgsData, isLoading: isOrgsLoading } = useGetOrgsQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  const [isFirstOrgModalOpen, setIsFirstOrgModalOpen] = React.useState(false);

  useEffect(() => {
    if (meData?.data) {
      dispatch(
        setCredentials({
          user: meData.data.user,
          organisations: meData.data.organisations,
        })
      );
    }
  }, [meData, dispatch]);

  useEffect(() => {
    if (orgsData?.data) {
      dispatch(setOrganisations(orgsData.data));
    }
  }, [orgsData, dispatch]);

  if (isMeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f5] text-slate-900">
        <LoadingSpinner
          size="lg"
          text="Authenticating DeployFlow session..."
        />
      </div>
    );
  }

  // Redirect users who are not authenticated.
  if (!isAuthenticated && (!meData || isMeError)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasNoOrgs = organisations.length === 0 && !isOrgsLoading;

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
      <Sidebar />

      <div className="ml-64 flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="mx-auto w-full max-w-7xl flex-1 p-5 md:p-8">
          {hasNoOrgs ? (
            <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Building2 className="h-7 w-7" />
              </div>

              <span className="mb-3 inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                GETTING STARTED
              </span>

              <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
                Welcome to DeployFlow
              </h2>

              <p className="mb-7 text-sm leading-6 text-slate-600">
                Create your first organisation to get started with team
                management, access permissions, subscription plans, and usage
                tracking.
              </p>

              <button
                onClick={() => setIsFirstOrgModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:w-auto"
              >
                <Building2 className="h-4 w-4" />
                Create your first organisation
                <ArrowRight className="h-4 w-4" />
              </button>

              <CreateOrgModal
                isOpen={isFirstOrgModalOpen}
                onClose={() => setIsFirstOrgModalOpen(false)}
              />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
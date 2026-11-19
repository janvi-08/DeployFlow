import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900">
              DeployFlow
            </span>
            <span className="hidden text-[10px] text-slate-500 sm:block">
              Team &amp; platform management
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link
            to="/"
            className="transition-colors hover:text-emerald-700"
          >
            Overview
          </Link>

          <Link
            to="/features"
            className="transition-colors hover:text-emerald-700"
          >
            Features
          </Link>

          <Link
            to="/pricing"
            className="transition-colors hover:text-emerald-700"
          >
            Pricing
          </Link>

          <a
            href="/healthz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Health check
          </a>
        </nav>

        {/* Authentication actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin/orgs"
                  className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 sm:inline-flex"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-800"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
import React from 'react';
import { Layers, Heart, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand and description */}
          <div className="space-y-4 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                <Layers className="h-5 w-5" />
              </div>

              <span className="text-lg font-bold tracking-tight text-slate-900">
                DeployFlow
              </span>
            </Link>

            <p className="text-sm leading-6 text-slate-600">
              A platform for managing teams, subscription plans, access
              permissions, and usage limits in a multi-tenant SaaS application.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Terminal className="h-4 w-4 text-emerald-700" />
              <span>Team and platform management</span>
            </div>
          </div>

          {/* Product navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900">
              Product
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-emerald-700"
                >
                  Overview
                </Link>
              </li>

              <li>
                <Link
                  to="/features"
                  className="transition-colors hover:text-emerald-700"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="transition-colors hover:text-emerald-700"
                >
                  Pricing and plans
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition-colors hover:text-emerald-700"
                >
                  Create an account
                </Link>
              </li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900">
              Account
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="transition-colors hover:text-emerald-700"
                >
                  Sign in
                </Link>
              </li>

              <li>
                <Link
                  to="/forgot-password"
                  className="transition-colors hover:text-emerald-700"
                >
                  Reset password
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-colors hover:text-emerald-700"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Service health */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900">
              Service status
            </h4>

            <p className="mb-4 text-sm leading-6 text-slate-600">
              Check the application's health and readiness endpoints.
            </p>

            <div className="flex flex-col items-start gap-3">
              <a
                href="/healthz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-emerald-700"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Health check
                <span className="text-xs text-slate-400">/healthz</span>
              </a>

              <a
                href="/readyz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-emerald-700"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Readiness check
                <span className="text-xs text-slate-400">/readyz</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} DeployFlow. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-1.5">
            Built for reliable team and platform management
            <Heart className="h-3.5 w-3.5 fill-emerald-700 text-emerald-700" />
          </p>
        </div>

      </div>
    </footer>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useGetPlansQuery } from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: plansData, isLoading } = useGetPlansQuery();
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Loading subscription tiers..." />
      </div>
    );
  }

  const plans = plansData?.data || [];

  return (
    <div className="min-h-screen bg-[#f4f7f5] selection:bg-emerald-100 selection:text-emerald-950">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12 sm:space-y-16">
        {/* Page heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 mb-5">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Simple, flexible plans
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight mb-5">
            Pricing that grows with your team
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-7 max-w-2xl mx-auto">
            Compare subscription tiers, team limits and usage quotas.
            Choose the plan that fits your project's needs.
          </p>
        </div>

        {/* Pricing cards */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan) => {
              const isPopular = plan.popular;

              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-200 ${
                    isPopular
                      ? 'bg-white border-2 border-emerald-700 shadow-xl shadow-emerald-950/5'
                      : 'bg-white border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/5'
                  }`}
                >
                  {/* Popular label */}
                  {isPopular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  )}

                  <div className="flex-1">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-slate-950">
                        {plan.name}
                      </h2>

                      {isPopular && (
                        <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>

                    <p className="mb-7 min-h-10 text-sm leading-6 text-slate-600">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-7 flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight text-slate-950">
                        ${plan.priceMonthly}
                      </span>
                      <span className="text-sm text-slate-500">
                        / month
                      </span>
                    </div>

                    {/* Quotas */}
                    <div className="mb-7 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">Deployments</span>
                        <span className="font-semibold text-slate-900">
                          {plan.quotas.deployments.toLocaleString()} / mo
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">Team seats</span>
                        <span className="font-semibold text-slate-900">
                          {plan.quotas.team_members.toLocaleString()} members
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">API calls</span>
                        <span className="font-semibold text-slate-900">
                          {plan.quotas.api_calls.toLocaleString()} / mo
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-600">Build minutes</span>
                        <span className="font-semibold text-slate-900">
                          {plan.quotas.build_minutes.toLocaleString()} min
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="mb-8 space-y-3.5">
                      {plan.features.map((feature, index) => (
                        <li
                          key={`${plan.id}-${index}`}
                          className="flex items-start gap-3 text-sm leading-5 text-slate-600"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        isAuthenticated
                          ? '/dashboard/billing'
                          : '/register'
                      );
                    }}
                    className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                      isPopular
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'border border-slate-300 bg-white text-slate-800 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    {isAuthenticated ? 'Manage plan' : 'Get started'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Plans are currently unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Please check your connection and try again.
            </p>
          </div>
        )}

        {/* Billing information */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Check className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Billing information
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Plan selection updates your subscription information.
                Online payments, invoices and payment-provider integration
                depend on the features implemented in your current project.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
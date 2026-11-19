import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  LockKeyhole,
  ShieldCheck,
  Users,
  Workflow,
  Zap,
  Sparkles,
  Sliders,
  Leaf,
} from "lucide-react";

const previews = {
  pipeline: {
    filename: "pipeline.yml",
    lines: [
      { number: "01", text: "name: DeployFlow Pipeline", color: "text-emerald-300" },
      { number: "02", text: "on: [push, pull_request]", color: "text-slate-300" },
      { number: "03", text: "jobs:", color: "text-sky-300" },
      { number: "04", text: "  validate:", color: "text-slate-300" },
      { number: "05", text: "    - lint", color: "text-amber-300" },
      { number: "06", text: "    - test", color: "text-amber-300" },
      { number: "07", text: "    - build", color: "text-amber-300" },
    ],
  },
  config: {
    filename: "rbac-rules.ts",
    lines: [
      { number: "01", text: "type Role = 'admin' | 'member';", color: "text-sky-300" },
      { number: "02", text: "", color: "text-slate-300" },
      { number: "03", text: "const permissions = {", color: "text-emerald-300" },
      { number: "04", text: "  admin: ['read', 'write', 'manage'],", color: "text-slate-300" },
      { number: "05", text: "  member: ['read'],", color: "text-slate-300" },
      { number: "06", text: "};", color: "text-emerald-300" },
    ],
  },
  quota: {
    filename: "quota-guard.ts",
    lines: [
      { number: "01", text: "async function checkQuota(orgId) {", color: "text-sky-300" },
      { number: "02", text: "  const usage = await getUsage(orgId);", color: "text-slate-300" },
      { number: "03", text: "  const plan = await getPlan(orgId);", color: "text-slate-300" },
      { number: "04", text: "", color: "text-slate-300" },
      { number: "05", text: "  if (usage >= plan.limit) {", color: "text-amber-300" },
      { number: "06", text: "    throw new Error('Quota exceeded');", color: "text-rose-300" },
      { number: "07", text: "  }", color: "text-slate-300" },
      { number: "08", text: "}", color: "text-sky-300" },
    ],
  },
};

type PreviewTab = keyof typeof previews;

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("pipeline");
  const [copied, setCopied] = useState(false);

  const isAuthenticated = useSelector(
    (state: any) => state.auth?.isAuthenticated ?? false
  );

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText("docker compose up --build");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const primaryHref = isAuthenticated ? "/dashboard" : "/register";

  const features = [
    {
      icon: Sparkles,
      title: "AI Incident Doctor & 1-Click Git Fix",
      description:
        "Autonomous SRE diagnostics analyze runtime pod stack traces and produce verified code patches in seconds.",
    },
    {
      icon: Sliders,
      title: "Predictive Blast Radius & Canary Scoring",
      description:
        "Pre-deployment risk assessment engine scores changes 0-100 to prevent production outages before rollout.",
    },
    {
      icon: Leaf,
      title: "EcoDeploy: Green Software Carbon Accounting",
      description:
        "Track and optimize cloud compute carbon emissions (g CO2e) per build across clean energy data centers.",
    },
    {
      icon: Users,
      title: "Organization management",
      description:
        "Keep teams and organization-level resources organized in one place.",
    },
    {
      icon: ShieldCheck,
      title: "Role-based access",
      description:
        "Structure permissions around roles so users can access the right resources.",
    },
    {
      icon: BarChart3,
      title: "Subscription and usage",
      description:
        "Bring plan information and usage tracking together for easier management.",
    },
    {
      icon: LockKeyhole,
      title: "Backend-enforced controls",
      description:
        "Keep important access and quota decisions on the server, not just in the UI.",
    },
    {
      icon: Workflow,
      title: "Pipeline visibility",
      description:
        "Present the stages of a delivery workflow in a clear, understandable format.",
    },
    {
      icon: Activity,
      title: "Service health",
      description:
        "Use health endpoints to help inspect the status of your application services.",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f7f5] text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Layers size={22} />
            </span>

            <span>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                DeployFlow
              </span>
              <span className="block text-xs text-slate-500">
                Team & platform management
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              Workflow
            </a>
            <Link
              to="/pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              to={primaryHref}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              {isAuthenticated ? "Dashboard" : "Get started"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.08),_transparent_60%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              A unified platform for your teams
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Manage your platform.
              <span className="mt-2 block text-emerald-700">
                Simplify delivery.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Organize teams, manage subscription plans, control access and
              monitor usage through one platform built around multi-tenant SaaS
              management.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                {isAuthenticated ? "Open dashboard" : "Get started"}
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Explore plans
                <ExternalLink size={16} />
              </Link>
            </div>

            <div className="mt-7">
              <button
                type="button"
                onClick={handleCopyInstall}
                className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                aria-label="Copy Docker Compose command"
              >
                <span className="text-emerald-700">&gt;_</span>
                docker compose up --build
                {copied ? (
                  <Check size={15} className="text-emerald-700" />
                ) : (
                  <Copy size={15} />
                )}
              </button>

              {copied && (
                <span className="ml-3 text-xs font-medium text-emerald-700">
                  Copied to clipboard
                </span>
              )}
            </div>
          </div>

          {/* Interactive code preview */}
          <div
            id="workflow"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-slate-300">
                  deployflow / project
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Activity size={13} />
                Code preview
              </span>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-slate-900/60 px-3 pt-2">
              {(Object.keys(previews) as PreviewTab[]).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 rounded-t-lg px-3 py-2.5 text-xs font-medium transition ${
                    activeTab === tab
                      ? "border-b-2 border-emerald-400 bg-white/5 text-emerald-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {previews[tab].filename}
                </button>
              ))}
            </div>

            <div className="min-h-64 space-y-3 px-4 py-6 sm:px-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">
                  {previews[activeTab].filename}
                </span>
                <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400">
                  Example
                </span>
              </div>

              <div className="space-y-3 overflow-x-auto">
                {previews[activeTab].lines.map((line) => (
                  <div
                    key={line.number}
                    className="flex min-w-max gap-5 font-mono text-xs sm:text-sm"
                  >
                    <span className="w-5 select-none text-right text-slate-600">
                      {line.number}
                    </span>
                    <span className={line.color}>
                      {line.text || "\u00a0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900/70 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Illustrative configuration
              </div>
              <span className="font-mono text-xs text-slate-500">
                {previews[activeTab].filename}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="border-y border-slate-200 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Users size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">
                Organized teams
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Manage organizations and their members.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">
                Controlled access
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Structure permissions around user roles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Zap size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">
                Clear usage visibility
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep subscription and quota information accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Platform capabilities
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Everything organized in one place
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            A clear interface for the key workflows involved in managing a
            multi-tenant SaaS application.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition group-hover:bg-emerald-100">
                  <Icon size={21} />
                </span>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-emerald-800 px-6 py-12 sm:px-12 sm:py-14 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
                Get started
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Bring your team workflows together.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-emerald-50/90">
                Explore the platform and see how organization management,
                access control and usage tracking fit together.
              </p>
            </div>

            <Link
              to={primaryHref}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              {isAuthenticated ? "Open dashboard" : "Create account"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Layers size={17} />
            </span>
            <span className="font-semibold text-slate-900">DeployFlow</span>
          </Link>

          <p className="text-sm text-slate-500">
            A platform for managing teams, access and subscriptions.
          </p>

          <div className="flex flex-wrap gap-5 text-sm text-slate-600">
            <Link
              to="/features"
              className="transition hover:text-emerald-700"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="transition hover:text-emerald-700"
            >
              Pricing
            </Link>
            <Link
              to="/login"
              className="transition hover:text-emerald-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
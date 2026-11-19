import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../features/store';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTemplatesQuery,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { CliModal } from '../../components/CliModal';
import {
  Rocket,
  Plus,
  ExternalLink,
  GitBranch,
  Terminal,
  Activity,
  Layers,
  Code2,
  Upload,
  Globe,
  Sparkles,
  CheckCircle2,
  Clock,
  HardDrive,
  Copy,
  Search,
  ArrowRight,
  X,
  FileCode,
  Laptop,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);

  const { data: projectsData, isLoading, refetch } = useGetProjectsQuery(
    activeOrgId || '',
    { skip: !activeOrgId, pollingInterval: 5000 }
  );

  const { data: templatesData } = useGetTemplatesQuery();
  const [createProjectMutation, { isLoading: isCreating }] = useCreateProjectMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'template' | 'upload' | 'code' | 'git'>('template');

  // Creation form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('portfolio');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const [codeSnippet, setCodeSnippet] = useState({
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Custom App on DeployFlow</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h1>🚀 Hello from DeployFlow!</h1>
    <p>This application was compiled and deployed live from the in-browser code editor.</p>
    <button onclick="alert('Client interactivity confirmed!')">Test Interaction</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    css: `body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #090d16;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}
.card {
  background: #101726;
  border: 1px solid #1e293b;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 440px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
h1 { color: #10b981; font-size: 1.75rem; margin-bottom: 0.5rem; }
p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
button {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}
button:hover { transform: scale(1.05); }`,
    js: `console.log("Custom app initialized via DeployFlow Engine.");`,
  });
  const [codeSubTab, setCodeSubTab] = useState<'html' | 'css' | 'js'>('html');
  const [zipBase64, setZipBase64] = useState<string | null>(null);
  const [zipFileName, setZipFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const projects = projectsData?.data || [];
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFramework = selectedFramework === 'all' || p.framework === selectedFramework;
    return matchesSearch && matchesFramework;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setZipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64 = result.split(',')[1];
      setZipBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Project name is required');
      return;
    }

    try {
      const payload: any = {
        orgId: activeOrgId,
        name: name.trim(),
        description: description.trim(),
        sourceType: activeTab,
      };

      if (activeTab === 'template') {
        payload.templateId = selectedTemplate;
        const tmpl = templatesData?.data?.find((t) => t.id === selectedTemplate);
        payload.framework = tmpl?.framework || 'static';
      } else if (activeTab === 'code') {
        payload.codeSnippet = codeSnippet;
        payload.framework = 'static';
      } else if (activeTab === 'upload') {
        if (!zipBase64) {
          setErrorMessage('Please choose a .zip file or HTML project folder to upload.');
          return;
        }
        payload.zipBase64 = zipBase64;
        payload.framework = 'static';
      } else if (activeTab === 'git') {
        if (!gitRepoUrl.trim()) {
          setErrorMessage('Git repository URL is required.');
          return;
        }
        payload.gitRepoUrl = gitRepoUrl.trim();
        payload.gitBranch = gitBranch.trim() || 'main';
        payload.framework = 'static';
      }

      const res = await createProjectMutation(payload).unwrap();
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setZipBase64(null);
      setZipFileName('');
      // Navigate to project details
      if (res.data?.project?._id) {
        navigate(`/dashboard/projects/${res.data.project._id}`);
      } else {
        refetch();
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || 'Deployment pipeline failed. Verify parameters and try again.'
      );
    }
  };

  const copyLiveUrl = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full);
    alert(`Copied live URL to clipboard: ${full}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deployed Projects
          </h1>
          <p className="text-sm text-slate-500">
            Manage your live hosted applications, preview responsive builds, and monitor real-time edge traffic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCliModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Terminal className="h-4 w-4 text-slate-500" />
            CLI
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Deploy New Project
          </button>
        </div>
      </div>

      {/* Search, Framework Filter & Statistics Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'static', label: 'Static' },
              { id: 'react', label: 'React' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedFramework(chip.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selectedFramework === chip.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Edge Anycast Live
          </span>
          <span>·</span>
          <span>{filteredProjects.length} Projects</span>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <LoadingSpinner text="Fetching active project deployments..." />
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Rocket className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No projects found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Launch your first high-speed static website or microservice from our curated templates, upload a ZIP, or paste your code.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Create Project Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const activeDep = project.activeDeployment;
            return (
              <div
                key={project._id}
                onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                        {project.framework === 'react' ? (
                          <Code2 className="h-5 w-5 text-sky-600" />
                        ) : (
                          <Globe className="h-5 w-5 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                          {project.name}
                        </h3>
                        <p className="font-mono text-[11px] text-slate-400">
                          {project.slug}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        project.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : project.status === 'deploying'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          project.status === 'active'
                            ? 'bg-emerald-500'
                            : project.status === 'deploying'
                              ? 'bg-amber-500 animate-ping'
                              : 'bg-rose-500'
                        }`}
                      ></span>
                      {project.status === 'active' ? 'Live' : project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Live URL Pill */}
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs">
                    <span className="truncate font-mono text-[11px] text-slate-600">
                      {project.liveUrl}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => copyLiveUrl(e, project.liveUrl)}
                        title="Copy Live URL"
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open Live Preview"
                        className="rounded p-1 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Commit message & stats */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <GitBranch className="h-3.5 w-3.5 text-slate-400" />
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                      {activeDep?.commit || 'main'}
                    </span>
                    <span className="truncate text-[11px]">
                      {activeDep?.message || 'Production release'}
                    </span>
                  </div>
                </div>

                {/* Footer Telemetry */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span title="Total Requests Handled">
                      ⚡ <strong>{project.analytics?.totalRequests || 0}</strong> reqs
                    </span>
                    <span title="Average Response Latency">
                      ⏱ <strong>{project.analytics?.avgResponseTimeMs || 12}ms</strong>
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                  Deploy New Application
                </h2>
                <p className="text-xs text-slate-500">
                  Provision an isolated edge sandbox and publish live in under 4 seconds.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error alert */}
            {errorMessage && (
              <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Scrollable Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Portfolio Website"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief architectural overview..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Source Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choose Deployment Source
                </label>
                <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-100 p-1.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('template')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      activeTab === 'template'
                        ? 'bg-white font-semibold text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      activeTab === 'upload'
                        ? 'bg-white font-semibold text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload ZIP
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      activeTab === 'code'
                        ? 'bg-white font-semibold text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="h-4 w-4" />
                    Code Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('git')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      activeTab === 'git'
                        ? 'bg-white font-semibold text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GitBranch className="h-4 w-4" />
                    Git Clone
                  </button>
                </div>
              </div>

              {/* Tab 1: Template selection */}
              {activeTab === 'template' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Select a fully configured, production-ready starter template:
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {templatesData?.data?.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                          selectedTemplate === tmpl.id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{tmpl.name}</h4>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {tmpl.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{tmpl.framework}</span>
                          <span>{tmpl.fileCount} bundled files</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload ZIP */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-800">
                      Upload project ZIP archive
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ensure your archive contains an <code className="text-emerald-700">index.html</code> at root or in <code className="text-emerald-700">dist/</code>.
                    </p>
                    <label className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50">
                      Choose Archive
                      <input
                        type="file"
                        accept=".zip,.tar,.gz"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {zipFileName && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">
                        ✓ Selected: {zipFileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Code Editor */}
              {activeTab === 'code' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Write or paste your code directly:
                    </span>
                    <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-[11px]">
                      {(['html', 'css', 'js'] as const).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setCodeSubTab(sub)}
                          className={`rounded px-2.5 py-1 font-mono uppercase ${
                            codeSubTab === sub
                              ? 'bg-white font-bold text-emerald-800 shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {codeSubTab === 'html' && (
                    <textarea
                      rows={8}
                      value={codeSnippet.html}
                      onChange={(e) => setCodeSnippet({ ...codeSnippet, html: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400 focus:outline-none"
                    />
                  )}
                  {codeSubTab === 'css' && (
                    <textarea
                      rows={8}
                      value={codeSnippet.css}
                      onChange={(e) => setCodeSnippet({ ...codeSnippet, css: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-sky-400 focus:outline-none"
                    />
                  )}
                  {codeSubTab === 'js' && (
                    <textarea
                      rows={8}
                      value={codeSnippet.js}
                      onChange={(e) => setCodeSnippet({ ...codeSnippet, js: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-amber-300 focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* Tab 4: Git Clone */}
              {activeTab === 'git' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Git Repository URL
                    </label>
                    <input
                      type="url"
                      value={gitRepoUrl}
                      onChange={(e) => setGitRepoUrl(e.target.value)}
                      placeholder="https://github.com/facebook/react"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Git Branch
                    </label>
                    <input
                      type="text"
                      value={gitBranch}
                      onChange={(e) => setGitBranch(e.target.value)}
                      placeholder="main"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition-all"
                >
                  {isCreating ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Executing Pipeline...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Publish &amp; Deploy Live
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLI Modal */}
      <CliModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
      />
    </div>
  );
};

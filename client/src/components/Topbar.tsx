import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../features/store';
import { useGetOrgsQuery } from '../services/api';
import {
  Search,
  Terminal,
  Rocket,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Badge } from './Badge';
import { CommandPalette } from './CommandPalette';
import { CliModal } from './CliModal';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);
  const { data: orgsData } = useGetOrgsQuery();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);

  const orgs = orgsData?.data || [];
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6">
        {/* Workspace info & Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-slate-900">
                {activeOrg ? activeOrg.name : 'Workspace'}
              </h2>

              {activeOrg?.slug && (
                <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-flex">
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  {activeOrg.slug}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 font-mono">
              Global Anycast Routing
            </p>
          </div>

          {activeOrg && (
            <Badge
              variant={
                activeOrg.plan === 'enterprise'
                  ? 'purple'
                  : activeOrg.plan === 'pro'
                    ? 'primary'
                    : 'neutral'
              }
              size="sm"
              dot
            >
              {activeOrg.plan.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Center: Vercel / Railway-style Search Bar & Command Palette Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm justify-center">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 transition-all hover:border-emerald-300 hover:bg-white hover:text-slate-700 hover:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search projects, commands...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Edge Latency Status */}
          <div
            title="DeployFlow Edge Network Status"
            className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Edge 12ms</span>
          </div>

          {/* CLI quick launcher */}
          <button
            onClick={() => setIsCliModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">CLI</span>
          </button>

          {/* Quick Deploy button */}
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>Deploy</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette & CLI Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      <CliModal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        projectSlug={activeOrg?.slug || 'my-project'}
        projectName={activeOrg?.name || 'My Project'}
      />
    </>
  );
};

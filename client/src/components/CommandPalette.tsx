import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import { useGetProjectsQuery, useGetOrgsQuery } from '../services/api';
import { setActiveOrgId } from '../features/authSlice';
import {
  Search,
  Rocket,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  BookOpen,
  Sparkles,
  Settings,
  FolderGit2,
  ExternalLink,
  Plus,
  Terminal,
  Shield,
  Copy,
  Building2,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Projects' | 'Quick Actions';
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeOrgId } = useSelector((state: RootState) => state.auth);

  const { data: projectsData } = useGetProjectsQuery(activeOrgId || '', { skip: !activeOrgId });
  const { data: orgsData } = useGetOrgsQuery();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const projects = projectsData?.data || [];
  const orgs = orgsData?.data || [];

  const baseItems: CommandItem[] = [
    {
      id: 'nav-overview',
      title: 'Overview Dashboard',
      subtitle: 'System health, quota meters and pipeline metrics',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => { navigate('/dashboard'); onClose(); },
      shortcut: 'G O',
    },
    {
      id: 'nav-projects',
      title: 'Projects & Deployments',
      subtitle: 'Manage live hosted applications & edge routing',
      category: 'Navigation',
      icon: Rocket,
      action: () => { navigate('/dashboard/projects'); onClose(); },
      shortcut: 'G P',
    },
    {
      id: 'nav-architecture',
      title: 'Architecture & Placement Viva',
      subtitle: 'RFC system blueprints and technical interview guide',
      category: 'Navigation',
      icon: BookOpen,
      action: () => { navigate('/dashboard/architecture'); onClose(); },
      shortcut: 'G A',
    },
    {
      id: 'nav-ai-ops',
      title: 'AI Ops & Automated SRE',
      subtitle: 'Simulate incidents, root-cause diagnosis, and rollbacks',
      category: 'Navigation',
      icon: Sparkles,
      action: () => { navigate('/dashboard/ai-ops'); onClose(); },
      shortcut: 'G S',
    },
    {
      id: 'nav-team',
      title: 'Team & RBAC Hierarchy',
      subtitle: 'Role permissions and seat quota management',
      category: 'Navigation',
      icon: Users,
      action: () => { navigate('/dashboard/team'); onClose(); },
    },
    {
      id: 'nav-billing',
      title: 'Subscription & Plans',
      subtitle: 'Free Starter, Professional, and Enterprise tiers',
      category: 'Navigation',
      icon: CreditCard,
      action: () => { navigate('/dashboard/billing'); onClose(); },
    },
    {
      id: 'nav-usage',
      title: 'Usage Analytics',
      subtitle: 'Deployments, API calls, and build minutes consumption',
      category: 'Navigation',
      icon: BarChart3,
      action: () => { navigate('/dashboard/usage'); onClose(); },
    },
    {
      id: 'act-new-project',
      title: 'Deploy New Project...',
      subtitle: 'Choose from Templates, ZIP Upload, or Code Editor',
      category: 'Quick Actions',
      icon: Plus,
      action: () => { navigate('/dashboard/projects'); onClose(); },
      shortcut: 'N',
    },
    {
      id: 'act-copy-org',
      title: 'Copy Active Workspace ID',
      subtitle: activeOrgId || '',
      category: 'Quick Actions',
      icon: Copy,
      action: () => {
        if (activeOrgId) {
          navigator.clipboard.writeText(activeOrgId);
          alert(`Workspace ID copied: ${activeOrgId}`);
        }
        onClose();
      },
    },
  ];

  // Dynamic project items
  const projectItems: CommandItem[] = projects.map((p) => ({
    id: `proj-${p._id}`,
    title: p.name,
    subtitle: `${p.liveUrl} · ${p.framework} · ${p.status}`,
    category: 'Projects',
    icon: FolderGit2,
    action: () => { navigate(`/dashboard/projects/${p._id}`); onClose(); },
  }));

  const allItems = [...projectItems, ...baseItems];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
          <Search className="h-5 w-5 text-emerald-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search projects... (e.g. portfolio, deploy, viva)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching commands or projects found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="truncate text-[11px] text-slate-400 font-normal">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-emerald-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-white border border-slate-200 px-1 py-0.5 font-mono text-[9px]">↑</kbd>{' '}
              <kbd className="rounded bg-white border border-slate-200 px-1 py-0.5 font-mono text-[9px]">↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded bg-white border border-slate-200 px-1 py-0.5 font-mono text-[9px]">↵</kbd> select
            </span>
          </div>
          <span>DeployFlow Edge Command Bar</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export const AdminLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Platform Admin Access Denied</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            This administration control panel requires platform administrator permissions. Your current role is{' '}
            <span className="font-semibold text-slate-800 font-mono">[{user?.role || 'unauthorized'}]</span>.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex selection:bg-emerald-100 selection:text-emerald-950">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

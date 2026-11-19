import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { User, Mail, Shield, Key, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/Badge';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">User Profile & Security</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your account credentials, platform roles, and security authentication policies.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-bold text-xl flex items-center justify-center shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1.5 flex items-center space-x-2">
              <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'}>
                {user?.role === 'admin' ? 'System Administrator' : 'Standard Developer'}
              </Badge>
              <Badge variant="success">Email Verified</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Account User ID
            </span>
            <span className="text-xs font-mono text-slate-800 font-semibold">{user?.id}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Account Created
            </span>
            <span className="text-xs text-slate-800 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Architecture Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <Shield className="w-4 h-4 text-emerald-600 mr-2" />
          Active Security Controls & Session Policies
        </h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                HttpOnly & SameSite Cookie Session Protection
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Authentication JWT tokens are stored within HttpOnly, SameSite cookies. JavaScript executed in the browser cannot read session tokens, rendering Cross-Site Scripting (XSS) token theft impossible.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Bcrypt Password Salting (12 Cryptographic Rounds)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Passwords are hashed before reaching database persistence with high computational work factors. Plaintext passwords are never logged or stored.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Pino Structured Logging & Redaction
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Backend services emit structured JSON logs. Authentication credentials and password hashes are automatically excluded from logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation } from '../../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials, setActiveOrgId } from '../../features/authSlice';
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loginTrigger, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await loginTrigger({ email: email.trim(), password }).unwrap();
      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            organisations: res.data.organisations,
          })
        );
        if (res.data.organisations && res.data.organisations.length > 0) {
          dispatch(setActiveOrgId(res.data.organisations[0].id));
        }
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Login failed. Invalid email or password.');
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@deployflow.io');
    setPassword('AdminSecurePass123!');
  };

  const handleFillDemo = () => {
    setEmail('test@deployflow.io');
    setPassword('SecurePassword123!');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Developer Sign In</h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Access your team workspaces, pipeline metrics, and RBAC controls.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Viva Quick Fill Profiles */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            Evaluation Quick-Fill Profiles
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-[11px] font-medium transition-colors text-center shadow-xs"
            >
              Fill System Admin
            </button>
            <button
              type="button"
              onClick={handleFillDemo}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors text-center shadow-xs"
            >
              Fill Demo User
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to DeployFlow</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have a team account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

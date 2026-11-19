import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../services/api';
import {
  Mail,
  Lock,
  Key,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [forgotPasswordTrigger, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [resetPasswordTrigger, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await forgotPasswordTrigger({ email: email.trim() }).unwrap();
      const devToken = res.data?.developmentToken;
      if (devToken) {
        setToken(devToken);
        setStep('reset');
        setFeedback({
          msg: `Development token generated and populated. In production this is delivered via secure email.`,
          type: 'success',
        });
      } else {
        setFeedback({
          msg: res.message || 'If that email exists, reset instructions have been generated.',
          type: 'success',
        });
      }
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to request reset token',
        type: 'error',
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ msg: 'Password must be at least 8 characters with 1 uppercase and 1 number.', type: 'error' });
      return;
    }

    try {
      const res = await resetPasswordTrigger({ token, password: newPassword }).unwrap();
      setFeedback({
        msg: res.message || 'Password reset successfully! You can now sign in with your new password.',
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to reset password. The token may have expired.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Password Recovery</h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {step === 'request'
              ? 'Enter your registered email address to receive a secure recovery token.'
              : 'Enter your new password to complete the credentials update.'}
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email Address
              </label>
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

            <button
              type="submit"
              disabled={isRequesting}
              className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isRequesting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <span>Request Reset Token</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recovery Token
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste recovery token"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              disabled={isResetting}
              className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isResetting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Set New Password</span>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 pt-2 transition-colors"
            >
              ← Back to request token
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

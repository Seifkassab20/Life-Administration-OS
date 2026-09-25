import React, { useState } from 'react';
import { Shield, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateSignUp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateSignUp }) => {
  const { t } = useLanguage();
  const { login, loginAsDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await login(email);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage(
      email
        ? `Password reset instruction sent to ${email} (Demo password is: password123).`
        : 'Tip: Demo account password is "password123", or click "Quick Demo Login" below.'
    );
  };

  const handleDemo = async () => {
    await loginAsDemo();
    onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your secure Life Administration OS documents
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-brand-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-slate-950 text-slate-500 text-xs uppercase font-semibold">
            Or Instant Demo
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemo}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-brand-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Quick Demo Login (Seif Kassab)</span>
        </button>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onNavigateSignUp}
            className="text-brand-400 font-semibold hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

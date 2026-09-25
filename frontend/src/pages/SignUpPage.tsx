import React, { useState } from 'react';
import { Shield, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignUpPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSuccess, onNavigateLogin }) => {
  const { login, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Start organizing and understanding your life documents
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seif Kassab"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-brand-400 font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { FileText, Mail, Lock, ShieldAlert, CheckCircle, RotateCw } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick sign-in helper
  const handleQuickLogin = async (role: 'USER' | 'ADMIN') => {
    const defaultEmail = role === 'ADMIN' ? 'admin@newsscript.ai' : 'user@newsscript.ai';
    const defaultPassword = role === 'ADMIN' ? 'adminpassword' : 'userpassword';
    
    setEmail(defaultEmail);
    setPassword(defaultPassword);
    
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: defaultEmail,
        password: defaultPassword,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-655 text-indigo-400 border border-indigo-500/20">
          <FileText size={24} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Sign In to NewsScript AI</h2>
        <p className="text-xs text-slate-500">Sign in to save articles, view history, and generate scripts.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/30 text-xs font-semibold text-red-400 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Email Address</label>
          <div className="relative rounded-lg border border-slate-800 bg-slate-950/80 p-2 flex items-center focus-within:border-indigo-500/50 transition-all">
            <Mail size={16} className="text-slate-500 ml-2" />
            <input
              type="email"
              placeholder="user@newsscript.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 px-3 py-1 text-sm text-slate-200 focus:outline-none focus:ring-0"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Password</label>
          <div className="relative rounded-lg border border-slate-800 bg-slate-950/80 p-2 flex items-center focus-within:border-indigo-500/50 transition-all">
            <Lock size={16} className="text-slate-500 ml-2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 px-3 py-1 text-sm text-slate-200 focus:outline-none focus:ring-0"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? <RotateCw size={16} className="animate-spin mr-2" /> : null}
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Quick seeded login credentials buttons */}
      <div className="pt-4 border-t border-slate-900 space-y-3">
        <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Dev Login</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin('USER')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <CheckCircle size={12} className="text-emerald-500" />
            Standard User
          </button>
          <button
            onClick={() => handleQuickLogin('ADMIN')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-800 py-2.5 text-xs font-semibold text-indigo-400 transition-all cursor-pointer"
          >
            <ShieldAlert size={12} className="text-indigo-400" />
            Admin User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <RotateCw size={36} className="text-indigo-500 animate-spin" />
        </div>
      }>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(99,102,241,0.1),rgba(255,255,255,0))]" />
          <LoginForm />
        </main>
      </Suspense>
    </div>
  );
}

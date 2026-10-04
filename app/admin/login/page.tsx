'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';
import Logo from '../../../components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@khutbah.mw');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate login verification
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas text-[#171717] flex flex-col justify-between p-4 sm:p-8">
      {/* Top bar with return link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Website</span>
        </Link>
        <span className="text-[10px] uppercase font-mono text-secondary">Secure Console</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block mb-2">
            <Logo size="md" />
          </div>
          <h1 className="font-serif-heading text-3xl font-medium text-[#171717]">
            Administrator Sign In
          </h1>
          <p className="text-xs text-secondary">
            Enter your authorized administrative credentials to access the management portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@khutbah.mw"
                className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#171717]">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-4 border-t border-black/6 text-center space-y-1">
          <p className="text-[11px] text-secondary">
            Protected by Better Auth & Granular Role Authorization
          </p>
          <p className="text-[10px] text-secondary/70">
            Listener accounts do not have access to administrative controls.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-secondary">
        &copy; {new Date().getFullYear()} Khutbah Platform • Islamic Media of Malawi
      </div>
    </div>
  );
}

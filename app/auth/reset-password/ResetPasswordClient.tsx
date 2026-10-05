'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Logo from '../../../components/Logo';
import { resetPasswordAction } from '../actions';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? 'Reset token is missing. Please click the exact link from your email.' : null
  );
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordAction({
      token,
      newPassword: password,
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || 'Failed to reset password. The link may have expired.');
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-heading text-2xl font-medium text-[#171717]">
            Password Reset Successfully
          </h2>
          <p className="text-xs text-secondary leading-relaxed">
            Your account password has been updated. You can now use your new credentials to sign in.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => router.push('/auth/admin/login')}
            className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Sign In to Admin Console &rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block mb-2">
          <Logo size="md" />
        </div>
        <h1 className="font-serif-heading text-3xl font-medium text-[#171717]">
          Create New Password
        </h1>
        <p className="text-xs text-secondary">
          Enter and confirm your new secure password below.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            New Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={!token}
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717] disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={!token}
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717] disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-black/6 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-xs text-secondary hover:text-[#171717] transition-colors"
        >
          Need a fresh reset link? Request again
        </Link>
      </div>
    </div>
  );
}

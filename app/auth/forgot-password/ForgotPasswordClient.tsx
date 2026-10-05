'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Logo from '../../../components/Logo';
import { requestPasswordResetAction } from '../actions';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await requestPasswordResetAction({ email });
    setLoading(false);

    if (res.success) {
      setSubmittedMessage(
        res.message || 'If an account exists with this email address, a password reset link has been dispatched.'
      );
    } else {
      setError(res.error || 'Failed to process password reset request.');
    }
  };

  if (submittedMessage) {
    return (
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-heading text-2xl font-medium text-[#171717]">
            Check Your Email
          </h2>
          <p className="text-xs text-secondary leading-relaxed">{submittedMessage}</p>
        </div>
        <div className="p-3.5 bg-black/5 rounded-xl text-[11px] text-secondary">
          Check your inbox and spam folder for the link from <strong>Khutbah Platform</strong>. The link expires in 60 minutes.
        </div>
        <div className="pt-2">
          <Link
            href="/auth/admin/login"
            className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors"
          >
            Back to Sign In
          </Link>
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
          Reset Password
        </h1>
        <p className="text-xs text-secondary">
          Enter your registered email address and we will dispatch a secure, expiring password reset link.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@khutbah.mw"
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <span>Send Reset Instructions</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-black/6 text-center">
        <Link
          href="/auth/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-[#171717] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Remember your password? Sign In</span>
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Logo from '../../../components/Logo';
import {
  getInvitationDetailsAction,
  acceptInvitationAction,
  InvitationDetailsResult,
} from '../actions';

export default function AcceptInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [details, setDetails] = useState<InvitationDetailsResult['invitation'] | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    role: string;
    loginUrl: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setTokenError('Invitation token is missing. Please check the link in your email invitation.');
        setLoadingDetails(false);
      });
      return () => {
        isMounted = false;
      };
    }

    getInvitationDetailsAction(token).then((res) => {
      if (!isMounted) return;
      setLoadingDetails(false);
      if (res.success && res.invitation) {
        setDetails(res.invitation);
      } else {
        setTokenError(res.error || 'Invalid or expired invitation token');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const res = await acceptInvitationAction({
      token,
      name,
      password,
    });
    setSubmitting(false);

    if (res.success) {
      setSuccessResult({
        role: res.role || 'user',
        loginUrl: res.loginUrl || '/auth/admin/login',
      });
    } else {
      setFormError(res.error || 'Failed to accept invitation. Please try again.');
    }
  };

  if (loadingDetails) {
    return (
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-10 border border-black/8 shadow-xl flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
        <p className="text-xs text-secondary font-mono">Validating invitation credentials...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-heading text-2xl font-medium text-[#171717]">
            Invitation Not Available
          </h2>
          <p className="text-xs text-secondary leading-relaxed">{tokenError}</p>
        </div>
        <div className="pt-4 border-t border-black/8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (successResult) {
    return (
      <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-heading text-2xl font-medium text-[#171717]">
            Account Setup Completed!
          </h2>
          <p className="text-xs text-secondary leading-relaxed">
            Welcome to Khutbah Malawi. Your account has been activated with{' '}
            <strong className="text-[#171717] uppercase tracking-wider">{successResult.role}</strong>{' '}
            privileges.
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => router.push(successResult.loginUrl)}
            className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In &rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-black/8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block mb-2">
          <Logo size="md" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 text-accent-orange text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive Invitation</span>
        </div>
        <h1 className="font-serif-heading text-3xl font-medium text-[#171717]">
          Accept Platform Invitation
        </h1>
        <p className="text-xs text-secondary">
          {details?.inviterName} has invited you to collaborate as{' '}
          <strong className="text-[#171717] capitalize">{details?.role}</strong>.
        </p>
      </div>

      {details?.message && (
        <div className="p-3.5 rounded-xl bg-white border border-black/8 text-xs italic text-secondary border-l-3 border-l-accent-orange">
          &ldquo;{details.message}&rdquo;
        </div>
      )}

      {details?.role === 'admin' && details.permissions && details.permissions.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white border border-black/8 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-orange" />
            <span>Pre-assigned Admin Permissions ({details.permissions.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {details.permissions.map((p) => (
              <span
                key={p}
                className="text-[10px] font-mono bg-black/5 text-[#171717] px-2 py-0.5 rounded"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {formError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              disabled
              value={details?.email || ''}
              className="w-full bg-black/5 text-secondary text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Your Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sheikh Bilal Muhammad"
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Choose Password *
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
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">
            Confirm Password *
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
              className="w-full bg-white text-xs px-3.5 pl-9 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Activating Account...</span>
            </>
          ) : (
            <span>Accept Invitation &amp; Join Platform</span>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-black/6 text-center">
        <p className="text-[11px] text-secondary">
          Protected by Khutbah Platform Security &amp; Better Auth
        </p>
      </div>
    </div>
  );
}

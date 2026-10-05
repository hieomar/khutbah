import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas text-[#171717] flex flex-col justify-between p-4 sm:p-8">
      {/* Top bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/auth/admin/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
        <span className="text-[10px] uppercase font-mono text-secondary">Password Reset</span>
      </div>

      {/* Main reset card */}
      <Suspense
        fallback={
          <div className="max-w-md w-full mx-auto bg-surface rounded-3xl p-8 border border-black/8 shadow-xl flex justify-center items-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        }
      >
        <ResetPasswordClient />
      </Suspense>

      {/* Footer */}
      <div className="text-center text-[11px] text-secondary">
        &copy; {new Date().getFullYear()} Khutbah Platform • Islamic Media of Malawi
      </div>
    </div>
  );
}

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AcceptInviteClient from './AcceptInviteClient';

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-canvas text-[#171717] flex flex-col justify-between p-4 sm:p-8">
      {/* Top navigation */}
      <div className="max-w-lg w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Khutbah Malawi</span>
        </Link>
        <span className="text-[10px] uppercase font-mono text-secondary">
          Invitation Portal
        </span>
      </div>

      {/* Main Form Content with Suspense */}
      <Suspense
        fallback={
          <div className="max-w-lg w-full mx-auto bg-surface rounded-3xl p-12 border border-black/8 shadow-xl flex justify-center items-center h-72">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        }
      >
        <AcceptInviteClient />
      </Suspense>

      {/* Footer */}
      <div className="text-center text-[11px] text-secondary">
        &copy; {new Date().getFullYear()} Khutbah Platform • Islamic Media of Malawi
      </div>
    </div>
  );
}

import React from 'react';
import { requireAdmin } from '../../lib/auth/session';
import AdminLayoutClient from './AdminLayoutClient';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Khutbah Malawi',
  description: 'Secure Administrative and Content Management Portal for Khutbah Malawi',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let currentUser;
  let authError: string | null = null;

  try {
    currentUser = await requireAdmin();
  } catch (error: unknown) {
    authError =
      error instanceof Error
        ? error.message
        : 'Access Denied: Authentication required.';
  }

  if (authError || !currentUser) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-black/10 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif-heading text-2xl font-medium text-[#171717]">
            Administrative Access Restricted
          </h2>
          <p className="text-xs text-secondary leading-relaxed">
            {authError ||
              'Only authorized platform administrators may access this console. Listener accounts and public visitors are not permitted.'}
          </p>
          <div className="pt-4 border-t border-black/8 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Platform</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayoutClient currentUser={currentUser}>{children}</AdminLayoutClient>;
}

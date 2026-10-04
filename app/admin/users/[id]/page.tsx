import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '../../../../lib/auth/session';
import { getUserById } from '../../../../lib/db/store';
import { ArrowLeft } from 'lucide-react';

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('users.view');
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Link>
      </div>

      {/* User Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                user.role === 'admin' ? 'bg-[#171717] text-white' : 'bg-black/5 text-secondary'
              }`}
            >
              {user.role}
            </span>
            <span className="text-xs font-medium text-emerald-700 capitalize">
              • {user.status}
            </span>
          </div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">{user.name}</h2>
          <p className="text-xs text-secondary font-mono">{user.email}</p>
        </div>
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-black/8 p-6 shadow-2xs space-y-4">
          <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
            Account Overview
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-black/5">
              <span className="text-secondary">Account ID</span>
              <span className="font-mono text-[#171717]">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/5">
              <span className="text-secondary">Email Status</span>
              <span className="text-[#171717]">
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/5">
              <span className="text-secondary">Created Date</span>
              <span className="text-[#171717]">
                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary">Last Updated</span>
              <span className="text-[#171717]">
                {new Date(user.updatedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions if Admin */}
        <div className="rounded-2xl bg-white border border-black/8 p-6 shadow-2xs space-y-4">
          <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
            Administrative Privileges
          </h3>
          {user.role === 'admin' ? (
            <div className="space-y-3">
              <p className="text-xs text-secondary">
                This administrator currently holds <strong>{user.permissions.length}</strong> active
                permissions:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {user.permissions.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-black/5 font-mono text-[10px] text-[#171717]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-secondary leading-relaxed">
              This account is assigned the <strong>Listener</strong> role and has no administrative
              permissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

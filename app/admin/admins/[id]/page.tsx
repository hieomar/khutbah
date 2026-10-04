import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '../../../../lib/auth/session';
import { getUserById } from '../../../../lib/db/store';
import { ArrowLeft } from 'lucide-react';

export default async function AdminAdminDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('admins.permissions.manage');
  const { id } = await params;
  const adminUser = await getUserById(id);

  if (!adminUser || adminUser.role !== 'admin') {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/admins"
          className="inline-flex items-center gap-2 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Administrators</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#171717] text-white">
              Administrator
            </span>
            <span className="text-xs font-medium text-emerald-700 capitalize">
              • {adminUser.status}
            </span>
          </div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            {adminUser.name}
          </h2>
          <p className="text-xs text-secondary font-mono">{adminUser.email}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-black/8 p-6 shadow-2xs space-y-4">
        <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
          Assigned Permissions ({adminUser.permissions.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {adminUser.permissions.map((p) => (
            <div
              key={p}
              className="p-3 rounded-xl bg-surface border border-black/5 flex items-center justify-between"
            >
              <span className="font-mono text-xs font-medium text-[#171717]">{p}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

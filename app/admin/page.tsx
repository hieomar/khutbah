import React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Headphones,
  Film,
  Archive,
  ArrowUpRight,
  PlusCircle,
  UserPlus,
  ScrollText,
  Clock,
} from 'lucide-react';
import { getDashboardStats, listAuditLogs } from '../../lib/db/store';
import { requireAdmin } from '../../lib/auth/session';
import { hasPermission } from '../../lib/auth/permissions';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();
  const { logs } = await listAuditLogs({ limit: 8 });

  const canCreateMedia = hasPermission(admin.permissions, 'media.create');
  const canInviteUsers = hasPermission(admin.permissions, 'users.invite');
  const canManageAdmins = hasPermission(admin.permissions, 'admins.permissions.manage');

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      label: 'All registered platform accounts',
      icon: <Users className="w-5 h-5 text-[#171717]" />,
      href: '/admin/users',
    },
    {
      title: 'Administrators',
      value: stats.totalAdmins,
      label: 'Active administrators with granular roles',
      icon: <ShieldCheck className="w-5 h-5 text-accent-gold" />,
      href: '/admin/admins',
    },
    {
      title: 'Listeners',
      value: stats.totalListeners,
      label: 'Public registered listeners',
      icon: <Headphones className="w-5 h-5 text-accent-orange" />,
      href: '/admin/users?role=listener',
    },
    {
      title: 'Published Media',
      value: stats.totalPublishedMedia,
      label: 'Active audio sermons & video lectures',
      icon: <Film className="w-5 h-5 text-[#171717]" />,
      href: '/admin/media',
    },
    {
      title: 'Archived Media',
      value: stats.totalArchivedMedia,
      label: 'Hidden recordings retained in archive',
      icon: <Archive className="w-5 h-5 text-secondary" />,
      href: '/admin/media?status=archived',
    },
  ];

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('restored')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (action.includes('updated') || action.includes('permissions')) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (action.includes('archived') || action.includes('revoked')) return 'text-stone-700 bg-stone-100 border-stone-200';
    if (action.includes('deleted')) return 'text-rose-700 bg-rose-50 border-rose-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-medium text-[#171717] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
            <span>Operational Console • Malawi Media</span>
          </div>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-medium text-[#171717] mb-1">
            Welcome, {admin.name}
          </h2>
          <p className="text-xs text-secondary">
            Manage platform users, audio khutbahs, video recordings, and administrative permissions.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canCreateMedia && (
            <Link
              href="/admin/media/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-accent-orange" />
              <span>Upload Media</span>
            </Link>
          )}

          {canInviteUsers && (
            <Link
              href="/admin/invitations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-medium text-[#171717] hover:bg-black/5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-accent-gold" />
              <span>Send Invite</span>
            </Link>
          )}
        </div>
      </div>

      {/* 5 Summary Statistics Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
          Platform Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => (
            <Link
              key={idx}
              href={stat.href}
              className="group p-5 rounded-2xl bg-white border border-black/8 hover:border-black/20 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-surface group-hover:scale-105 transition-transform">
                    {stat.icon}
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-secondary group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="font-serif-heading text-3xl font-medium text-[#171717] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-[#171717]">{stat.title}</div>
              </div>
              <p className="text-[10px] text-secondary leading-tight pt-3 border-t border-black/5 mt-3">
                {stat.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Recent Activity & Admin Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT (8 cols): Recent Administrative Activity */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-black/8 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/6">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#171717]" />
              <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
                Recent Administrative Activity
              </h3>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-secondary hover:text-[#171717] font-medium"
            >
              View full audit log →
            </Link>
          </div>

          {logs.length > 0 ? (
            <div className="divide-y divide-black/5">
              {logs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-xs font-medium text-[#171717]">
                        {log.targetSummary}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary">
                      Initiated by <strong>{log.actorName}</strong> ({log.actorEmail})
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-secondary/70 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(log.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-secondary">
              No administrative activity recorded yet.
            </div>
          )}
        </div>

        {/* RIGHT (4 cols): Active Permissions & Safeguards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-surface border border-black/8 p-6 shadow-2xs">
            <h3 className="font-serif-heading text-lg font-medium text-[#171717] mb-1">
              Your Permission Profile
            </h3>
            <p className="text-xs text-secondary mb-4">
              Granular privileges granted to your administrator session:
            </p>

            <div className="space-y-1.5 mb-6 max-h-56 overflow-y-auto pr-1">
              {admin.permissions.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-black/5 text-xs"
                >
                  <span className="font-mono text-[11px] text-[#171717]">{perm}</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">Active</span>
                </div>
              ))}
            </div>

            {canManageAdmins && (
              <Link
                href="/admin/admins"
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                <span>Manage Other Administrators</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

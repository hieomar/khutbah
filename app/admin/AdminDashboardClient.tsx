'use client';

import React, { useEffect, useState, useTransition } from 'react';
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
  Radio,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { AdminUserData, AuditLogData } from '../../lib/db/store';
import { DashboardStatsData, AdminSSEPayload } from '../../lib/events/admin-events';
import { hasPermission } from '../../lib/auth/permissions';
import { triggerLiveAuditSimulationAction } from './actions';

interface AdminDashboardClientProps {
  currentUser: AdminUserData;
  initialStats: DashboardStatsData;
  initialLogs: AuditLogData[];
}

export default function AdminDashboardClient({
  currentUser,
  initialStats,
  initialLogs,
}: AdminDashboardClientProps) {
  const [stats, setStats] = useState<DashboardStatsData>(initialStats);
  const [logs, setLogs] = useState<AuditLogData[]>(initialLogs);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'error'
  >('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [isSimulating, startSimulating] = useTransition();
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  // Real-Time Server-Sent Events (SSE) Subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      setConnectionStatus('connecting');

      try {
        eventSource = new EventSource('/api/admin/events');

        eventSource.onopen = () => {
          setConnectionStatus('connected');
          setLastSyncTime(new Date());
        };

        eventSource.onmessage = (event) => {
          try {
            const payload: AdminSSEPayload = JSON.parse(event.data);

            if (payload.type === 'init') {
              if (payload.stats) setStats(payload.stats);
              if (payload.logs) setLogs(payload.logs);
              setLastSyncTime(new Date());
            } else if (payload.type === 'stats') {
              setStats(payload.stats);
              setLastSyncTime(new Date());
            } else if (payload.type === 'audit') {
              const newEntry = payload.log;
              setLogs((prev) => {
                // Avoid duplicates
                if (prev.some((item) => item.id === newEntry.id)) return prev;
                return [newEntry, ...prev.slice(0, 49)];
              });

              // Mark as new for highlighting
              setNewLogIds((prev) => {
                const updated = new Set(prev);
                updated.add(newEntry.id);
                return updated;
              });

              // Clear highlight after 6 seconds
              setTimeout(() => {
                setNewLogIds((prev) => {
                  const updated = new Set(prev);
                  updated.delete(newEntry.id);
                  return updated;
                });
              }, 6000);

              setLastSyncTime(new Date());
            } else if (payload.type === 'ping') {
              setLastSyncTime(new Date());
            }
          } catch (err) {
            console.error('Failed to parse SSE payload:', err);
          }
        };

        eventSource.onerror = () => {
          setConnectionStatus('error');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimeout = setTimeout(() => {
            connectSSE();
          }, 4000);
        };
      } catch (err) {
        console.error('EventSource initialization error:', err);
        setConnectionStatus('error');
      }
    }

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const handleSimulateActivity = () => {
    startSimulating(async () => {
      setSimulationMessage(null);
      const res = await triggerLiveAuditSimulationAction();
      if (res.success && res.log) {
        setSimulationMessage(`Broadcasted: ${res.log.targetSummary}`);
        setTimeout(() => setSimulationMessage(null), 4000);
      }
    });
  };

  const canCreateMedia = hasPermission(currentUser.permissions, 'media.create');
  const canInviteUsers = hasPermission(currentUser.permissions, 'users.invite');
  const canManageAdmins = hasPermission(currentUser.permissions, 'admins.permissions.manage');

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      label: 'All registered platform accounts',
      icon: <Users className="w-5 h-5 text-[#171717]" />,
      href: '/admin/users',
      badge: 'Real-time',
    },
    {
      title: 'Administrators',
      value: stats.totalAdmins,
      label: 'Active administrators with granular roles',
      icon: <ShieldCheck className="w-5 h-5 text-accent-gold" />,
      href: '/admin/admins',
      badge: 'Roles',
    },
    {
      title: 'Listeners',
      value: stats.totalListeners,
      label: 'Public registered listeners',
      icon: <Headphones className="w-5 h-5 text-accent-orange" />,
      href: '/admin/users?role=listener',
      badge: 'Audience',
    },
    {
      title: 'Published Media',
      value: stats.totalPublishedMedia,
      label: 'Active audio sermons & video lectures',
      icon: <Film className="w-5 h-5 text-[#171717]" />,
      href: '/admin/media',
      badge: 'Live Content',
    },
    {
      title: 'Archived Media',
      value: stats.totalArchivedMedia,
      label: 'Hidden recordings retained in archive',
      icon: <Archive className="w-5 h-5 text-secondary" />,
      href: '/admin/media?status=archived',
      badge: 'Vault',
    },
  ];

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('restored'))
      return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (action.includes('updated') || action.includes('permissions'))
      return 'text-amber-800 bg-amber-50 border-amber-200';
    if (action.includes('archived') || action.includes('revoked'))
      return 'text-stone-800 bg-stone-100 border-stone-200';
    if (action.includes('deleted')) return 'text-rose-800 bg-rose-50 border-rose-200';
    return 'text-slate-800 bg-slate-50 border-slate-200';
  };

  const filteredLogs = logs.filter((log) => {
    if (domainFilter !== 'all' && !log.action.startsWith(domainFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetSummary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Real-time SSE Live Indicator & Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Live SSE Status Pill */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="font-mono">
                {connectionStatus === 'connected'
                  ? 'SSE Live Stream: Connected'
                  : connectionStatus === 'connecting'
                  ? 'Connecting SSE...'
                  : 'Live Stream: Reconnecting'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/5 text-[11px] font-medium text-secondary">
              <Radio className="w-3 h-3 text-accent-orange" />
              <span>Malawi Media Operations</span>
            </div>
          </div>

          <h2 className="font-serif-heading text-2xl sm:text-3xl font-medium text-[#171717] mb-1">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs text-secondary">
            Real-time platform administration, multimedia catalogue, user roles, and security audit trail.
          </p>

          {lastSyncTime && (
            <p className="text-[10px] text-secondary/70 font-mono mt-2">
              Last synced via Server-Sent Events:{' '}
              {lastSyncTime.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* Quick Action Buttons & Simulation Test */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Real-time SSE Live Test Trigger */}
          <button
            onClick={handleSimulateActivity}
            disabled={isSimulating}
            title="Trigger a real administrative action to broadcast over SSE"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface border border-black/15 text-xs font-medium text-[#171717] hover:bg-black/5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 text-accent-orange animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            )}
            <span>{isSimulating ? 'Broadcasting...' : 'Broadcast Test Event'}</span>
          </button>

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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-medium text-[#171717] hover:bg-black/5 transition-all shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-accent-gold" />
              <span>Send Invite</span>
            </Link>
          )}
        </div>
      </div>

      {simulationMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">Live Event Dispatched:</span>
            <span>{simulationMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700">Pushed via SSE</span>
        </div>
      )}

      {/* 5 Summary Statistics Cards with Live SSE Counts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
            <span>Platform Metrics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </h3>
          <span className="text-[11px] font-mono text-secondary">
            Auto-updates via SSE stream
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => (
            <Link
              key={idx}
              href={stat.href}
              className="group p-5 rounded-2xl bg-white border border-black/8 hover:border-black/25 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-surface group-hover:scale-105 transition-transform">
                    {stat.icon}
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-secondary group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="font-serif-heading text-3xl font-medium text-[#171717] mb-1 transition-all duration-300">
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
        <div className="lg:col-span-8 rounded-2xl bg-white border border-black/8 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/6 gap-3">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#171717]" />
              <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
                Live Administrative Activity
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#171717]">
                {filteredLogs.length} events
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/audit-logs"
                className="text-xs text-secondary hover:text-[#171717] font-medium"
              >
                View full audit log →
              </Link>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pb-2">
            <div className="relative w-full sm:flex-1">
              <Search className="w-3.5 h-3.5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live stream logs..."
                className="w-full bg-surface text-xs text-[#171717] placeholder-secondary/70 pl-8 pr-3 py-1.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
              <Filter className="w-3.5 h-3.5 text-secondary" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-surface border border-black/8 text-[11px] font-medium text-[#171717] rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">All Domains</option>
                <option value="media">Media Operations</option>
                <option value="user">User Accounts</option>
                <option value="admin">Admin Roles</option>
                <option value="invitation">Invitations</option>
              </select>
            </div>
          </div>

          {/* Live Activity Stream List */}
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-black/5 max-h-130 overflow-y-auto pr-1">
              {filteredLogs.map((log) => {
                const isFresh = newLogIds.has(log.id);

                return (
                  <div
                    key={log.id}
                    className={`py-3.5 flex items-start justify-between gap-4 transition-all duration-700 rounded-xl px-2.5 ${
                      isFresh ? 'bg-emerald-50/70 border border-emerald-200' : 'hover:bg-black/2'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                        {isFresh && (
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                            LIVE
                          </span>
                        )}
                        <span className="text-xs font-medium text-[#171717] truncate">
                          {log.targetSummary}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary">
                        Initiated by <strong>{log.actorName}</strong> ({log.actorEmail})
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-[10px] font-mono text-secondary/80 bg-surface/80 px-2 py-1 rounded border border-black/5 mt-1 inline-block">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-secondary/80 font-mono shrink-0 pt-0.5">
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
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-secondary">
              No administrative activity recorded matching criteria.
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
              {currentUser.permissions.map((perm) => (
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
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors shadow-2xs"
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

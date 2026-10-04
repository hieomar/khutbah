'use client';

import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { AuditLogData } from '../../../lib/db/store';

interface AuditLogsClientProps {
  initialLogs: AuditLogData[];
}

export default function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs] = useState<AuditLogData[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && !log.action.startsWith(actionFilter)) return false;
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

  const getBadgeStyle = (action: string) => {
    if (action.includes('created') || action.includes('restored'))
      return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (action.includes('updated') || action.includes('permissions'))
      return 'text-amber-800 bg-amber-50 border-amber-200';
    if (action.includes('archived') || action.includes('revoked'))
      return 'text-stone-800 bg-stone-100 border-stone-200';
    if (action.includes('deleted')) return 'text-rose-800 bg-rose-50 border-rose-200';
    return 'text-slate-800 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
          Security & Audit Logs
        </h2>
        <p className="text-xs text-secondary">
          Immutable chronological record of privileged administrative actions, media publishing, and
          permission grants.
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actor, action, or target..."
              className="w-full bg-surface text-xs text-[#171717] placeholder-secondary/70 pl-9 pr-4 py-2 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Domain:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Domains</option>
                <option value="user">User Actions</option>
                <option value="admin">Admin Permissions</option>
                <option value="media">Media Operations</option>
                <option value="invitation">Invitations</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white border border-black/8 shadow-2xs overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-black/8 text-secondary font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-5">Operation Summary & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/2 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-5 font-mono text-[11px] text-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[#171717]">
                          {new Date(log.createdAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${getBadgeStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#171717]">{log.actorName}</div>
                      <div className="text-[10px] font-mono text-secondary">{log.actorEmail}</div>
                    </td>

                    {/* Summary & Details */}
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#171717] text-xs mb-1">
                        {log.targetSummary}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="p-2 rounded-lg bg-surface text-[10px] font-mono text-secondary max-w-lg overflow-x-auto">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-secondary">
            No audit logs found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}

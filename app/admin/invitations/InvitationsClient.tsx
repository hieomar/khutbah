'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  RotateCcw,
  Ban,
  X,
} from 'lucide-react';
import { InvitationData, AdminUserData } from '../../../lib/db/store';
import { inviteUserAction, revokeInvitationAction, resendInvitationAction } from '../actions';
import { hasPermission, PermissionId } from '../../../lib/auth/permissions';
import PermissionSelector from '../../../components/admin/PermissionSelector';

interface InvitationsClientProps {
  initialInvitations: InvitationData[];
  currentUser: AdminUserData;
}

export default function InvitationsClient({
  initialInvitations,
  currentUser,
}: InvitationsClientProps) {
  const [invitations, setInvitations] = useState<InvitationData[]>(initialInvitations);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [form, setForm] = useState<{
    email: string;
    role: 'admin' | 'listener';
    permissions: PermissionId[];
    message: string;
  }>({
    email: '',
    role: 'admin',
    permissions: ['media.view', 'media.create', 'users.view'],
    message: 'You have been invited to collaborate on the Khutbah Malawi Islamic Media platform.',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canInvite = hasPermission(currentUser.permissions, 'users.invite');

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await inviteUserAction(form);
    setLoading(false);

    if (res.success && res.invitation) {
      setInvitations([res.invitation, ...invitations]);
      setIsInviteOpen(false);
      setForm({
        email: '',
        role: 'admin',
        permissions: ['media.view', 'media.create', 'users.view'],
        message: '',
      });
      setMessage({
        type: 'success',
        text: `Secure invitation dispatched to ${res.invitation.email}.`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to send invitation' });
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    setLoading(true);
    setMessage(null);

    const res = await revokeInvitationAction(id);
    setLoading(false);

    if (res.success && res.invitation) {
      setInvitations(invitations.map((inv) => (inv.id === id ? res.invitation : inv)));
      setMessage({ type: 'success', text: `Revoked invitation for ${email}. Token invalidated.` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to revoke invitation' });
    }
  };

  const handleResend = async (id: string, email: string) => {
    setLoading(true);
    setMessage(null);

    const res = await resendInvitationAction(id);
    setLoading(false);

    if (res.success && res.invitation) {
      setInvitations(invitations.map((inv) => (inv.id === id ? res.invitation : inv)));
      setMessage({
        type: 'success',
        text: `Refreshed and resent invitation to ${email}. Valid for 7 days.`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to resend invitation' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            Invitation Management
          </h2>
          <p className="text-xs text-secondary">
            Send secure, expiring invitations with predetermined granular permission profiles.
          </p>
        </div>

        {canInvite && (
          <button
            onClick={() => {
              setMessage(null);
              setIsInviteOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-accent-orange" />
            <span>Send New Invitation</span>
          </button>
        )}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Invitations Table */}
      <div className="rounded-2xl bg-white border border-black/8 shadow-2xs overflow-hidden">
        {invitations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-black/8 text-secondary font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-3.5 px-5">Invited Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Sent</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/2 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#171717] font-mono">{inv.email}</div>
                      {inv.message && (
                        <div className="text-[11px] text-secondary italic truncate max-w-xs">
                          &ldquo;{inv.message}&rdquo;
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          inv.role === 'admin'
                            ? 'bg-[#171717] text-white'
                            : 'bg-black/5 text-secondary'
                        }`}
                      >
                        {inv.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          inv.status === 'pending'
                            ? 'text-amber-700'
                            : inv.status === 'accepted'
                            ? 'text-emerald-700'
                            : inv.status === 'expired'
                            ? 'text-stone-500'
                            : 'text-rose-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === 'pending'
                              ? 'bg-amber-500'
                              : inv.status === 'accepted'
                              ? 'bg-emerald-500'
                              : inv.status === 'expired'
                              ? 'bg-stone-400'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="capitalize">{inv.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-secondary font-mono text-[11px]">
                      {new Date(inv.createdAt).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-4 px-4 text-secondary font-mono text-[11px]">
                      {new Date(inv.expiresAt).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {inv.status === 'pending' && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleResend(inv.id, inv.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface text-[#171717] hover:bg-black/10 transition-colors cursor-pointer"
                            title="Resend invitation"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Resend</span>
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.id, inv.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Revoke and invalidate token"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
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
            No invitations created yet.
          </div>
        )}
      </div>

      {/* Modal: Send Invitation */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Send User Invitation
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="scholar@masjid.mw"
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Assigned Platform Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as 'admin' | 'listener' })
                  }
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                >
                  <option value="admin">Administrator (with granular permissions)</option>
                  <option value="listener">Listener (Standard public account)</option>
                </select>
              </div>

              {form.role === 'admin' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#171717] mb-2">
                    Pre-assigned Permissions
                  </label>
                  <PermissionSelector
                    selectedPermissions={form.permissions}
                    onChange={(perms) => setForm({ ...form, permissions: perms })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Personalized Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Welcome to our editorial team..."
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loading ? 'Sending...' : 'Dispatch Secure Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

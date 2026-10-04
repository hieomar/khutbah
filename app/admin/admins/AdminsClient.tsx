'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit,
  X,
  Search,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminUserData } from '../../../lib/db/store';
import { updateAdminPermissionsAction, createUserAction } from '../actions';
import { hasPermission, PermissionId, ALL_PERMISSION_IDS } from '../../../lib/auth/permissions';
import PermissionSelector from '../../../components/admin/PermissionSelector';

interface AdminsClientProps {
  initialAdmins: AdminUserData[];
  currentUser: AdminUserData;
}

export default function AdminsClient({ initialAdmins, currentUser }: AdminsClientProps) {
  const [admins, setAdmins] = useState<AdminUserData[]>(initialAdmins);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserData | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionId[]>([]);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  // New admin form
  const [newAdminForm, setNewAdminForm] = useState<{
    name: string;
    email: string;
    permissions: PermissionId[];
  }>({
    name: '',
    email: '',
    permissions: ['media.view', 'users.view'],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManagePermissions = hasPermission(currentUser.permissions, 'admins.permissions.manage');
  const canCreateAdmin = hasPermission(currentUser.permissions, 'admins.create');

  const filteredAdmins = admins.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate permission diff before saving
  const calculateDiff = () => {
    if (!editingAdmin) return { added: [], removed: [] };
    const current = new Set(editingAdmin.permissions);
    const updated = new Set(selectedPermissions);

    const added = selectedPermissions.filter((p) => !current.has(p));
    const removed = editingAdmin.permissions.filter((p) => !updated.has(p));

    return { added, removed };
  };

  const { added, removed } = calculateDiff();

  const handleOpenPermissionEditor = (admin: AdminUserData) => {
    setMessage(null);
    setEditingAdmin(admin);
    setSelectedPermissions([...admin.permissions]);
  };

  const handleSavePermissions = async () => {
    if (!editingAdmin) return;
    setLoading(true);
    setMessage(null);

    const res = await updateAdminPermissionsAction({
      userId: editingAdmin.id,
      permissions: selectedPermissions,
    });

    setLoading(false);
    setIsDiffOpen(false);

    if (res.success && res.user) {
      setAdmins(admins.map((a) => (a.id === res.user.id ? res.user : a)));
      setEditingAdmin(null);
      setMessage({
        type: 'success',
        text: `Permissions updated successfully for administrator ${res.user.name}`,
      });
    } else {
      setMessage({
        type: 'error',
        text: res.error || 'Failed to update administrator permissions',
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await createUserAction({
      name: newAdminForm.name,
      email: newAdminForm.email,
      role: 'admin',
      status: 'active',
      permissions: newAdminForm.permissions,
    });

    setLoading(false);

    if (res.success && res.user) {
      setAdmins([res.user, ...admins]);
      setIsInviteOpen(false);
      setNewAdminForm({ name: '', email: '', permissions: ['media.view', 'users.view'] });
      setMessage({
        type: 'success',
        text: `Created administrator account for ${res.user.name} with ${newAdminForm.permissions.length} permissions assigned`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create administrator' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            Administrator Management
          </h2>
          <p className="text-xs text-secondary">
            Assign granular permissions to platform administrators following the principle of least
            privilege.
          </p>
        </div>

        {canCreateAdmin && (
          <button
            onClick={() => {
              setMessage(null);
              setIsInviteOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-accent-gold" />
            <span>Create Administrator</span>
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

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search administrators by name or email..."
            className="w-full bg-surface text-xs text-[#171717] placeholder-secondary/70 pl-9 pr-4 py-2 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
          />
        </div>
      </div>

      {/* Administrators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAdmins.map((admin) => {
          const isSelf = admin.id === currentUser.id;
          const hasFullControl = admin.permissions.includes('admins.permissions.manage');

          return (
            <div
              key={admin.id}
              className="p-6 rounded-2xl bg-white border border-black/8 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
                        {admin.name}
                      </h3>
                      {isSelf && (
                        <span className="text-[10px] font-semibold bg-black/5 text-[#171717] px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary font-mono">{admin.email}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      hasFullControl
                        ? 'bg-[#171717] text-white'
                        : 'bg-surface text-secondary border border-black/8'
                    }`}
                  >
                    <ShieldCheck
                      className={`w-3 h-3 ${hasFullControl ? 'text-accent-gold' : 'text-accent-orange'}`}
                    />
                    <span>{hasFullControl ? 'Super Admin' : 'Admin'}</span>
                  </span>
                </div>

                {/* Permissions Preview */}
                <div className="space-y-2 pt-3 border-t border-black/6">
                  <div className="flex items-center justify-between text-[11px] text-secondary">
                    <span>Granted Privileges:</span>
                    <strong className="text-[#171717]">
                      {admin.permissions.length} of {ALL_PERMISSION_IDS.length}
                    </strong>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {admin.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded bg-surface text-[10px] font-mono text-[#171717] border border-black/5"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-black/6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-secondary">
                  Added {new Date(admin.createdAt).toLocaleDateString('en-GB')}
                </span>

                {canManagePermissions && !isSelf && (
                  <button
                    onClick={() => handleOpenPermissionEditor(admin)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#171717] text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-accent-orange" />
                    <span>Edit Permissions</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Modal: Edit Permissions */}
      {editingAdmin && !isDiffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <div>
                <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                  Edit Administrator Permissions
                </h3>
                <p className="text-xs text-secondary">
                  Target Administrator: <strong>{editingAdmin.name}</strong> ({editingAdmin.email})
                </p>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              <PermissionSelector
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                canManageAdmins={canManagePermissions}
              />

              <div className="pt-4 border-t border-black/8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setIsDiffOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black cursor-pointer shadow-xs"
                >
                  <span>Review Permission Changes</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-orange" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Permission Diff & Confirmation Step */}
      {isDiffOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-amber-100 text-amber-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
                  Confirm Permission Changes
                </h3>
                <p className="text-xs text-secondary">{editingAdmin.email}</p>
              </div>
            </div>

            {/* Added Permissions */}
            {added.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-900 uppercase">
                  + Permissions being added ({added.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {added.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded bg-emerald-100 font-mono text-[10px] text-emerald-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Permissions */}
            {removed.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-900 uppercase">
                  - Permissions being revoked ({removed.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {removed.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded bg-rose-100 font-mono text-[10px] text-rose-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {added.length === 0 && removed.length === 0 && (
              <div className="p-4 text-center text-xs text-secondary bg-white rounded-xl">
                No permission changes detected.
              </div>
            )}

            <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDiffOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? 'Saving...' : 'Confirm & Apply Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Create Administrator */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Create Administrator
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="e.g. Sheikh Salim Kazembe"
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="admin@domain.mw"
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#171717] mb-2">
                  Assign Least-Privilege Permissions *
                </label>
                <PermissionSelector
                  selectedPermissions={newAdminForm.permissions}
                  onChange={(perms) => setNewAdminForm({ ...newAdminForm, permissions: perms })}
                />
              </div>

              <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

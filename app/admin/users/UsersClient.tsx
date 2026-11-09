'use client';

import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  KeyRound,
  Edit,
  Shield,
  Building2,
  X,
  Eye,
} from 'lucide-react';
import { AdminUserData } from '../../../lib/db/store';
import {
  createUserAction,
  updateUserAction,
  initiatePasswordResetAction,
} from '../actions';
import { hasPermission, PermissionId } from '../../../lib/auth/permissions';
import PermissionSelector from '../../../components/admin/PermissionSelector';

interface UsersClientProps {
  initialUsers: AdminUserData[];
  currentUser: AdminUserData;
}

export default function UsersClient({ initialUsers, currentUser }: UsersClientProps) {
  const [users, setUsers] = useState<AdminUserData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUserData | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUserData | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'listener' | 'mosque';
    status: 'active' | 'suspended' | 'pending';
    permissions: PermissionId[];
  }>({
    name: '',
    email: '',
    role: 'listener',
    status: 'pending',
    permissions: ['users.view', 'media.view'],
  });

  const [editForm, setEditForm] = useState<{
    id: string;
    name: string;
    role: 'admin' | 'listener' | 'mosque';
    status: 'active' | 'suspended' | 'pending';
  }>({
    id: '',
    name: '',
    role: 'listener',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Permissions checks
  const canCreate = hasPermission(currentUser.permissions, 'users.create');
  const canUpdate = hasPermission(currentUser.permissions, 'users.update');
  const canResetPass = hasPermission(currentUser.permissions, 'users.reset_password');

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await createUserAction(createForm);
    setLoading(false);

    if (res.success && res.user) {
      setUsers([res.user, ...users]);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        email: '',
        role: 'listener',
        status: 'active',
        permissions: ['users.view', 'media.view'],
      });
      setMessage({ type: 'success', text: `Successfully created account for ${res.user.name}` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create user' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateUserAction(editForm);
    setLoading(false);

    if (res.success && res.user) {
      setUsers(users.map((u) => (u.id === res.user?.id ? res.user : u)));
      setEditingUser(null);
      setMessage({ type: 'success', text: `Profile updated for ${res.user.name}` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update user' });
    }
  };

  const handlePasswordReset = async () => {
    if (!resettingUser) return;
    setLoading(true);
    setMessage(null);

    const res = await initiatePasswordResetAction(resettingUser.id);
    setLoading(false);
    setResettingUser(null);

    if (res.success) {
      setMessage({
        type: 'success',
        text: res.message || `Password reset link dispatched to ${resettingUser.email}`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to initiate password reset' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            User Management
          </h2>
          <p className="text-xs text-secondary">
            Manage authenticated platform users, role assignments, and security status.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setMessage(null);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-accent-orange" />
            <span>Create Account</span>
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

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name or email address..."
              className="w-full bg-surface text-xs pl-9 pr-4 py-2 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="mosque">Mosque Rep</option>
                <option value="listener">Listeners</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table (Desktop) & Cards (Mobile) */}
      <div className="rounded-2xl bg-white border border-black/8 shadow-2xs overflow-hidden">
        {filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-black/8 text-secondary font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-black/2 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-[#171717]">{u.name}</div>
                        <div className="text-[11px] text-secondary">{u.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-[#171717] text-white'
                              : u.role === 'mosque'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-black/5 text-secondary'
                          }`}
                        >
                          {u.role === 'admin' && <Shield className="w-2.5 h-2.5 text-accent-orange" />}
                          {u.role === 'mosque' && <Building2 className="w-2.5 h-2.5" />}
                          <span>{u.role === 'mosque' ? 'Mosque Rep' : u.role}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            u.status === 'active'
                              ? 'text-emerald-700'
                              : u.status === 'suspended'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active'
                                ? 'bg-emerald-600'
                                : u.status === 'suspended'
                                ? 'bg-rose-600'
                                : 'bg-amber-600'
                            }`}
                          />
                          <span className="capitalize">{u.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-secondary font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedUserDetails(u)}
                            className="p-1.5 rounded-lg text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canUpdate && (
                            <button
                              onClick={() => {
                                setEditForm({
                                  id: u.id,
                                  name: u.name,
                                  role: u.role,
                                  status: u.status,
                                });
                                setEditingUser(u);
                              }}
                              className="p-1.5 rounded-lg text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canResetPass && (
                            <button
                              onClick={() => setResettingUser(u)}
                              className="p-1.5 rounded-lg text-secondary hover:text-accent-orange hover:bg-black/5 transition-colors cursor-pointer"
                              title="Initiate Password Reset"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="divide-y divide-black/5 md:hidden">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#171717]">{u.name}</h4>
                      <p className="text-xs text-secondary">{u.email}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        u.role === 'admin'
                          ? 'bg-[#171717] text-white'
                          : u.role === 'mosque'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-black/5 text-secondary'
                      }`}
                    >
                      {u.role === 'mosque' ? 'Mosque Rep' : u.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span className="capitalize">{u.status}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedUserDetails(u)}
                      className="px-3 py-1 rounded-lg text-xs bg-black/5 text-[#171717]"
                    >
                      Details
                    </button>
                    {canUpdate && (
                      <button
                        onClick={() => {
                          setEditForm({
                            id: u.id,
                            name: u.name,
                            role: u.role,
                            status: u.status,
                          });
                          setEditingUser(u);
                        }}
                        className="px-3 py-1 rounded-lg text-xs bg-black/5 text-[#171717]"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-xs text-secondary">
            No users found matching your search criteria.
          </div>
        )}
      </div>

      {/* 1. Modal: Create User */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Create User Account
              </h3>
              <p className="text-[11px] text-secondary mt-1">
                A verification email will be sent to the user to set up their password and activate their account.
              </p>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Sheikh Imran"
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
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@khutbah.mw"
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value as 'admin' | 'listener' | 'mosque',
                      })
                    }
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                  >
                    <option value="listener">Listener</option>
                    <option value="mosque">Mosque Rep</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        status: e.target.value as 'active' | 'suspended' | 'pending',
                      })
                    }
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* If creating Admin, show permission selector */}
              {createForm.role === 'admin' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#171717] mb-2">
                    Administrator Permissions
                  </label>
                  <PermissionSelector
                    selectedPermissions={createForm.permissions}
                    onChange={(perms) => setCreateForm({ ...createForm, permissions: perms })}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Edit User Account
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full bg-black/5 text-xs px-3.5 py-2.5 rounded-xl border border-black/10 text-secondary cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value as 'admin' | 'listener' | 'mosque' })
                    }
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                  >
                    <option value="listener">Listener</option>
                    <option value="mosque">Mosque Rep</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as 'active' | 'suspended' | 'pending',
                      })
                    }
                    className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: User Details */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-lg w-full">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                User Profile Details
              </h3>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-black/5">
                <div>
                  <span className="text-secondary block">Name</span>
                  <span className="font-semibold text-[#171717] text-sm">
                    {selectedUserDetails.name}
                  </span>
                </div>
                <div>
                  <span className="text-secondary block">Role</span>
                  <span className="font-bold text-[#171717] uppercase">
                    {selectedUserDetails.role === 'mosque' ? 'Mosque Rep' : selectedUserDetails.role}
                  </span>
                </div>
                <div>
                  <span className="text-secondary block">Email</span>
                  <span className="font-mono text-[#171717]">{selectedUserDetails.email}</span>
                </div>
                <div>
                  <span className="text-secondary block">Status</span>
                  <span className="capitalize font-semibold text-emerald-700">
                    {selectedUserDetails.status}
                  </span>
                </div>
              </div>

              {selectedUserDetails.role === 'mosque' && selectedUserDetails.mosque && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Associated Mosque</span>
                  </div>
                  <div className="font-medium text-[#171717]">{selectedUserDetails.mosque.name}</div>
                  <div className="text-[11px] text-secondary">{selectedUserDetails.mosque.location}</div>
                </div>
              )}

              {selectedUserDetails.role === 'admin' && (
                <div className="p-4 rounded-2xl bg-white border border-black/5">
                  <span className="text-xs font-semibold text-[#171717] block mb-2">
                    Assigned Permissions ({selectedUserDetails.permissions.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {selectedUserDetails.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded bg-black/5 font-mono text-[10px] text-[#171717]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Password Reset Confirmation */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Reset User Password
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Are you sure you want to send a secure password reset link to{' '}
              <strong className="text-[#171717]">{resettingUser.email}</strong>? They will be
              dispatched a token valid for 1 hour to establish new login credentials.
            </p>

            <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 rounded-xl text-xs text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handlePasswordReset}
                className="px-5 py-2.5 rounded-xl bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/90 disabled:opacity-50 shadow-xs"
              >
                {loading ? 'Dispatching...' : 'Dispatch Reset Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

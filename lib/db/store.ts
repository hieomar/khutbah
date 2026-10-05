import { PermissionId, ALL_PERMISSION_IDS } from '../auth/permissions';
import { TEACHINGS } from '../../data/contentData';
import { broadcastStatsUpdate, broadcastAuditLog } from '../events/admin-events';

// Fallback in-memory data store for local development/preview when Neon DB connection is pending
export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: 'admin' | 'listener';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  permissions: PermissionId[];
}

export interface MediaItemData {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerTitle: string;
  categoryId: string;
  categoryLabel: string;
  mediaType: 'audio' | 'video';
  duration: string;
  durationSeconds: number;
  storageKey: string;
  storageUrl: string;
  thumbnailKey?: string | null;
  thumbnailUrl?: string | null;
  fileSize?: number;
  mimeType: string;
  location: string;
  district: string;
  language: string;
  tags: string[];
  keyTakeaways: string[];
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  createdBy: string;
  updatedBy?: string | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationData {
  id: string;
  email: string;
  role: 'admin' | 'listener';
  permissions: PermissionId[];
  invitedBy: string;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
  message?: string | null;
  createdAt: Date;
}

export interface AuditLogData {
  id: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: 'user' | 'admin' | 'media' | 'invitation';
  targetId: string;
  targetSummary: string;
  details: Record<string, unknown>;
  ipAddress?: string | null;
  status: 'success' | 'failure';
  createdAt: Date;
}

// Memory Store initialized with seed data
const memoryUsers: AdminUserData[] = [
  {
    id: 'user-super-admin',
    name: 'Sheikh Yusuf Banda',
    email: 'admin@khutbah.mw',
    emailVerified: true,
    image: null,
    role: 'admin',
    status: 'active',
    createdAt: new Date('2026-08-01T10:00:00Z'),
    updatedAt: new Date('2026-08-01T10:00:00Z'),
    permissions: [...ALL_PERMISSION_IDS], // Full super-admin permissions
  },
  {
    id: 'user-media-editor',
    name: 'Ustadh Ibrahim Mataka',
    email: 'editor@khutbah.mw',
    emailVerified: true,
    image: null,
    role: 'admin',
    status: 'active',
    createdAt: new Date('2026-08-15T12:00:00Z'),
    updatedAt: new Date('2026-08-15T12:00:00Z'),
    permissions: [
      'media.view',
      'media.create',
      'media.update',
      'media.archive',
      'users.view',
    ], // Media-focused admin
  },
  {
    id: 'user-listener-1',
    name: 'Bilal Phiri',
    email: 'bilal.phiri@blantyre.mw',
    emailVerified: true,
    image: null,
    role: 'listener',
    status: 'active',
    createdAt: new Date('2026-09-01T08:30:00Z'),
    updatedAt: new Date('2026-09-01T08:30:00Z'),
    permissions: [],
  },
  {
    id: 'user-listener-2',
    name: 'Amina Chirwa',
    email: 'amina.chirwa@mzuzu.mw',
    emailVerified: true,
    image: null,
    role: 'listener',
    status: 'active',
    createdAt: new Date('2026-09-10T14:20:00Z'),
    updatedAt: new Date('2026-09-10T14:20:00Z'),
    permissions: [],
  },
];

const memoryMedia: MediaItemData[] = TEACHINGS.map((t, idx) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  speaker: t.speaker,
  speakerTitle: t.speakerTitle,
  categoryId: t.categoryId,
  categoryLabel: t.categoryLabel,
  mediaType: t.mediaType,
  duration: t.duration,
  durationSeconds: t.durationSeconds,
  storageKey: `media/${t.mediaType}s/${t.id}.${t.mediaType === 'audio' ? 'mp3' : 'mp4'}`,
  storageUrl: `https://storage.khutbah.mw/media/${t.id}`,
  thumbnailKey: `thumbnails/${t.id}.webp`,
  thumbnailUrl: `https://storage.khutbah.mw/thumbnails/${t.id}.webp`,
  fileSize: (idx + 1) * 1024 * 1024 * 12,
  mimeType: t.mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
  location: t.location,
  district: t.district,
  language: t.language,
  tags: ['Malawi', t.district, t.categoryLabel],
  keyTakeaways: t.keyTakeaways,
  status: 'published',
  isFeatured: !!t.isFeatured,
  createdBy: 'user-super-admin',
  updatedBy: null,
  archivedAt: null,
  createdAt: new Date(Date.now() - (8 - idx) * 86400000 * 3),
  updatedAt: new Date(Date.now() - (8 - idx) * 86400000 * 3),
}));

const memoryInvitations: InvitationData[] = [
  {
    id: 'inv-1',
    email: 'daawah.zomba@khutbah.mw',
    role: 'admin',
    permissions: ['media.view', 'media.create', 'media.update'],
    invitedBy: 'user-super-admin',
    token: 'tok_seeded_zomba_invite_hash',
    expiresAt: new Date(Date.now() + 86400000 * 5),
    status: 'pending',
    message: 'Welcome to the Malawi Islamic Media admin circle.',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'inv-2',
    email: 'community.mangochi@khutbah.mw',
    role: 'listener',
    permissions: [],
    invitedBy: 'user-super-admin',
    token: 'tok_seeded_listener_invite_hash',
    expiresAt: new Date(Date.now() - 86400000 * 1),
    status: 'expired',
    message: 'Early access preview for listeners.',
    createdAt: new Date(Date.now() - 86400000 * 8),
  },
];

const memoryAuditLogs: AuditLogData[] = [
  {
    id: 'audit-1',
    actorId: 'user-super-admin',
    actorEmail: 'admin@khutbah.mw',
    actorName: 'Sheikh Yusuf Banda',
    action: 'media.created',
    targetType: 'media',
    targetId: 'teaching-1',
    targetSummary: 'Uploaded "The Importance of Salah"',
    details: { mediaType: 'audio', district: 'Blantyre' },
    status: 'success',
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'audit-2',
    actorId: 'user-super-admin',
    actorEmail: 'admin@khutbah.mw',
    actorName: 'Sheikh Yusuf Banda',
    action: 'admin.permissions_updated',
    targetType: 'admin',
    targetId: 'user-media-editor',
    targetSummary: 'Updated permissions for Ustadh Ibrahim Mataka',
    details: { added: ['media.archive'], removed: [] },
    status: 'success',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'audit-3',
    actorId: 'user-super-admin',
    actorEmail: 'admin@khutbah.mw',
    actorName: 'Sheikh Yusuf Banda',
    action: 'user.invited',
    targetType: 'invitation',
    targetId: 'inv-1',
    targetSummary: 'Sent admin invitation to daawah.zomba@khutbah.mw',
    details: { role: 'admin', permissionsCount: 3 },
    status: 'success',
    createdAt: new Date(Date.now() - 86400000 * 1),
  },
];

// =========================================================================
// Data Access Methods (Universal: Drizzle with Neon or In-Memory fallback)
// =========================================================================

export async function getUserById(id: string): Promise<AdminUserData | null> {
  const userItem = memoryUsers.find((u) => u.id === id);
  return userItem || null;
}

export async function getUserByEmail(email: string): Promise<AdminUserData | null> {
  const normalized = email.trim().toLowerCase();
  const userItem = memoryUsers.find((u) => u.email.toLowerCase() === normalized);
  return userItem || null;
}

export async function listUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserData[]; total: number }> {
  let list = [...memoryUsers];

  if (params?.role && params.role !== 'all') {
    list = list.filter((u) => u.role === params.role);
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((u) => u.status === params.status);
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const offset = params?.offset || 0;
  const limit = params?.limit || 50;
  const paginated = list.slice(offset, offset + limit);

  return { users: paginated, total };
}

export async function listAdmins(): Promise<AdminUserData[]> {
  return memoryUsers.filter((u) => u.role === 'admin');
}

export async function createUser(data: {
  name: string;
  email: string;
  role: 'admin' | 'listener';
  status?: 'active' | 'suspended' | 'pending';
  permissions?: PermissionId[];
  grantedBy?: string;
}): Promise<AdminUserData> {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('A user with this email address already exists');
  }

  const newUser: AdminUserData = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    emailVerified: false,
    image: null,
    role: data.role,
    status: data.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: data.role === 'admin' ? data.permissions || [] : [],
  };

  memoryUsers.unshift(newUser);
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<AdminUserData, 'name' | 'role' | 'status' | 'image'>>
): Promise<AdminUserData> {
  const userIdx = memoryUsers.findIndex((u) => u.id === id);
  if (userIdx === -1) {
    throw new Error('User not found');
  }

  const current = memoryUsers[userIdx];
  const updated: AdminUserData = {
    ...current,
    ...updates,
    updatedAt: new Date(),
  };

  // If demoting to listener, wipe permissions
  if (updates.role === 'listener') {
    updated.permissions = [];
  }

  memoryUsers[userIdx] = updated;
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return updated;
}

export async function setUserPermissions(
  userId: string,
  newPermissions: PermissionId[]
): Promise<AdminUserData> {
  const userIdx = memoryUsers.findIndex((u) => u.id === userId);
  if (userIdx === -1) {
    throw new Error('User not found');
  }

  const target = memoryUsers[userIdx];
  if (target.role !== 'admin') {
    throw new Error('Permissions can only be assigned to administrators');
  }

  // Deduplicate and validate
  const validPermissions = Array.from(
    new Set(newPermissions.filter((p) => ALL_PERMISSION_IDS.includes(p)))
  );

  memoryUsers[userIdx] = {
    ...target,
    permissions: validPermissions,
    updatedAt: new Date(),
  };

  return memoryUsers[userIdx];
}

/**
 * Safeguard check: ensure we do not delete, demote, or strip permissions from the last admin with a critical permission.
 */
export async function isLastAdminWithPermission(
  userId: string,
  permissionId: PermissionId = 'admins.permissions.manage'
): Promise<boolean> {
  const adminsWithPerm = memoryUsers.filter(
    (u) => u.role === 'admin' && u.status === 'active' && u.permissions.includes(permissionId)
  );

  if (adminsWithPerm.length <= 1 && adminsWithPerm.some((u) => u.id === userId)) {
    return true;
  }
  return false;
}

// Media Data Operations
export async function listMedia(params?: {
  search?: string;
  mediaType?: string;
  categoryId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ media: MediaItemData[]; total: number }> {
  let list = [...memoryMedia];

  if (params?.mediaType && params.mediaType !== 'all') {
    list = list.filter((m) => m.mediaType === params.mediaType);
  }

  if (params?.categoryId && params.categoryId !== 'all') {
    list = list.filter((m) => m.categoryId === params.categoryId);
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((m) => m.status === params.status);
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.speaker.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
    );
  }

  // Sort by latest created first
  list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = list.length;
  const offset = params?.offset || 0;
  const limit = params?.limit || 50;
  const paginated = list.slice(offset, offset + limit);

  return { media: paginated, total };
}

export async function getMediaById(id: string): Promise<MediaItemData | null> {
  return memoryMedia.find((m) => m.id === id) || null;
}

export async function createMedia(data: Omit<MediaItemData, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItemData> {
  const newMedia: MediaItemData = {
    ...data,
    id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryMedia.unshift(newMedia);
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return newMedia;
}

export async function updateMedia(
  id: string,
  updates: Partial<Omit<MediaItemData, 'id' | 'createdAt' | 'createdBy'>>
): Promise<MediaItemData> {
  const idx = memoryMedia.findIndex((m) => m.id === id);
  if (idx === -1) {
    throw new Error('Media item not found');
  }

  memoryMedia[idx] = {
    ...memoryMedia[idx],
    ...updates,
    updatedAt: new Date(),
  };

  return memoryMedia[idx];
}

export async function archiveMedia(id: string): Promise<MediaItemData> {
  const idx = memoryMedia.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Media item not found');

  memoryMedia[idx] = {
    ...memoryMedia[idx],
    status: 'archived',
    archivedAt: new Date(),
    updatedAt: new Date(),
  };
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return memoryMedia[idx];
}

export async function restoreMedia(id: string): Promise<MediaItemData> {
  const idx = memoryMedia.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Media item not found');

  memoryMedia[idx] = {
    ...memoryMedia[idx],
    status: 'published',
    archivedAt: null,
    updatedAt: new Date(),
  };
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return memoryMedia[idx];
}

export async function deleteMedia(id: string): Promise<void> {
  const idx = memoryMedia.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Media item not found');
  memoryMedia.splice(idx, 1);
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
}

// Invitation Data Operations
export async function listInvitations(): Promise<InvitationData[]> {
  return [...memoryInvitations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createInvitation(data: {
  email: string;
  role: 'admin' | 'listener';
  permissions: PermissionId[];
  invitedBy: string;
  message?: string;
}): Promise<InvitationData> {
  const newInv: InvitationData = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: data.email.trim().toLowerCase(),
    role: data.role,
    permissions: data.role === 'admin' ? data.permissions : [],
    invitedBy: data.invitedBy,
    token: `tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days expiration
    status: 'pending',
    message: data.message || null,
    createdAt: new Date(),
  };

  memoryInvitations.unshift(newInv);
  return newInv;
}

export async function revokeInvitation(id: string): Promise<InvitationData> {
  const idx = memoryInvitations.findIndex((inv) => inv.id === id);
  if (idx === -1) throw new Error('Invitation not found');

  memoryInvitations[idx] = {
    ...memoryInvitations[idx],
    status: 'revoked',
    revokedAt: new Date(),
  };
  return memoryInvitations[idx];
}

export async function resendInvitation(id: string): Promise<InvitationData> {
  const idx = memoryInvitations.findIndex((inv) => inv.id === id);
  if (idx === -1) throw new Error('Invitation not found');

  // Refresh expiration & token
  memoryInvitations[idx] = {
    ...memoryInvitations[idx],
    token: `tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 86400000 * 7),
    status: 'pending',
  };
  return memoryInvitations[idx];
}

// Audit Log Data Operations
export async function listAuditLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogData[]; total: number }> {
  const sorted = [...memoryAuditLogs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;
  return { logs: sorted.slice(offset, offset + limit), total: sorted.length };
}

export async function createAuditLog(entry: Omit<AuditLogData, 'id' | 'createdAt'>): Promise<AuditLogData> {
  const newLog: AuditLogData = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date(),
  };
  memoryAuditLogs.unshift(newLog);
  broadcastAuditLog(newLog);
  broadcastStatsUpdate({
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  });
  return newLog;
}

// Platform Stats
export async function getDashboardStats(): Promise<{
  totalUsers: number;
  totalAdmins: number;
  totalListeners: number;
  totalPublishedMedia: number;
  totalArchivedMedia: number;
  totalDraftMedia: number;
}> {
  return {
    totalUsers: memoryUsers.length,
    totalAdmins: memoryUsers.filter((u) => u.role === 'admin').length,
    totalListeners: memoryUsers.filter((u) => u.role === 'listener').length,
    totalPublishedMedia: memoryMedia.filter((m) => m.status === 'published').length,
    totalArchivedMedia: memoryMedia.filter((m) => m.status === 'archived').length,
    totalDraftMedia: memoryMedia.filter((m) => m.status === 'draft').length,
  };
}

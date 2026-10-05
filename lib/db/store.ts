import { eq, desc, and, or, ilike, inArray, count } from 'drizzle-orm';
import { db } from './index';
import * as schema from './schema';
import { PermissionId, ALL_PERMISSION_IDS } from '../auth/permissions';
import { broadcastStatsUpdate, broadcastAuditLog } from '../events/admin-events';

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

// =========================================================================
// Real Database Operations (Drizzle ORM over Neon PostgreSQL)
// =========================================================================

export async function getUserById(id: string): Promise<AdminUserData | null> {
  const [userRow] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, id))
    .limit(1);

  if (!userRow) return null;

  const perms = await db
    .select({ permissionId: schema.adminPermission.permissionId })
    .from(schema.adminPermission)
    .where(eq(schema.adminPermission.userId, id));

  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    emailVerified: userRow.emailVerified,
    image: userRow.image,
    role: userRow.role as 'admin' | 'listener',
    status: userRow.status as 'active' | 'suspended' | 'pending',
    createdAt: userRow.createdAt,
    updatedAt: userRow.updatedAt,
    permissions: perms.map((p) => p.permissionId as PermissionId),
  };
}

export async function getUserByEmail(email: string): Promise<AdminUserData | null> {
  const [userRow] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email.trim().toLowerCase()))
    .limit(1);

  if (!userRow) return null;

  const perms = await db
    .select({ permissionId: schema.adminPermission.permissionId })
    .from(schema.adminPermission)
    .where(eq(schema.adminPermission.userId, userRow.id));

  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    emailVerified: userRow.emailVerified,
    image: userRow.image,
    role: userRow.role as 'admin' | 'listener',
    status: userRow.status as 'active' | 'suspended' | 'pending',
    createdAt: userRow.createdAt,
    updatedAt: userRow.updatedAt,
    permissions: perms.map((p) => p.permissionId as PermissionId),
  };
}

export async function listUsers(params?: {
  role?: 'admin' | 'listener';
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserData[]; total: number }> {
  const conditions = [];

  if (params?.role) {
    conditions.push(eq(schema.user.role, params.role));
  }
  if (params?.status) {
    conditions.push(eq(schema.user.status, params.status));
  }
  if (params?.search) {
    const q = `%${params.search.toLowerCase()}%`;
    conditions.push(or(ilike(schema.user.name, q), ilike(schema.user.email, q)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: count() })
    .from(schema.user)
    .where(whereClause);

  const total = Number(countResult?.count || 0);
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  const userRows = await db
    .select()
    .from(schema.user)
    .where(whereClause)
    .orderBy(desc(schema.user.createdAt))
    .limit(limit)
    .offset(offset);

  const userIds = userRows.map((u) => u.id);

  const allAdminPerms =
    userIds.length > 0
      ? await db
          .select({
            userId: schema.adminPermission.userId,
            permissionId: schema.adminPermission.permissionId,
          })
          .from(schema.adminPermission)
          .where(inArray(schema.adminPermission.userId, userIds))
      : [];

  const permsByUser = new Map<string, PermissionId[]>();
  for (const row of allAdminPerms) {
    const existing = permsByUser.get(row.userId) || [];
    existing.push(row.permissionId as PermissionId);
    permsByUser.set(row.userId, existing);
  }

  const users: AdminUserData[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image,
    role: u.role as 'admin' | 'listener',
    status: u.status as 'active' | 'suspended' | 'pending',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    permissions: permsByUser.get(u.id) || [],
  }));

  return { users, total };
}

export async function listAdmins(): Promise<AdminUserData[]> {
  const result = await listUsers({ role: 'admin', limit: 100 });
  return result.users;
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

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(schema.user).values({
    id,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    emailVerified: false,
    image: null,
    role: data.role,
    status: data.status || 'active',
    createdAt: now,
    updatedAt: now,
  });

  if (data.role === 'admin' && data.permissions && data.permissions.length > 0) {
    const permInserts = data.permissions.map((p) => ({
      id: crypto.randomUUID(),
      userId: id,
      permissionId: p,
      grantedBy: data.grantedBy || null,
      grantedAt: now,
    }));
    await db.insert(schema.adminPermission).values(permInserts);
  }

  const created = await getUserById(id);
  if (!created) throw new Error('Failed to retrieve newly created user');

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return created;
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<AdminUserData, 'name' | 'role' | 'status' | 'image'>>
): Promise<AdminUserData> {
  const now = new Date();

  await db
    .update(schema.user)
    .set({
      ...updates,
      updatedAt: now,
    })
    .where(eq(schema.user.id, id));

  if (updates.role === 'listener') {
    await db
      .delete(schema.adminPermission)
      .where(eq(schema.adminPermission.userId, id));
  }

  const updated = await getUserById(id);
  if (!updated) throw new Error('User not found after update');

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return updated;
}

export async function setUserPermissions(
  userId: string,
  newPermissions: PermissionId[]
): Promise<AdminUserData> {
  const target = await getUserById(userId);
  if (!target) throw new Error('User not found');
  if (target.role !== 'admin') {
    throw new Error('Permissions can only be assigned to administrators');
  }

  const validPermissions = Array.from(
    new Set(newPermissions.filter((p) => ALL_PERMISSION_IDS.includes(p)))
  );

  await db
    .delete(schema.adminPermission)
    .where(eq(schema.adminPermission.userId, userId));

  if (validPermissions.length > 0) {
    const now = new Date();
    await db.insert(schema.adminPermission).values(
      validPermissions.map((p) => ({
        id: crypto.randomUUID(),
        userId,
        permissionId: p,
        grantedAt: now,
      }))
    );
  }

  await db
    .update(schema.user)
    .set({ updatedAt: new Date() })
    .where(eq(schema.user.id, userId));

  const updated = await getUserById(userId);
  if (!updated) throw new Error('Failed to retrieve user after permissions update');

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return updated;
}

export async function isLastAdminWithPermission(
  userId: string,
  permissionId: PermissionId = 'admins.permissions.manage'
): Promise<boolean> {
  const adminsWithPerm = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .innerJoin(
      schema.adminPermission,
      eq(schema.user.id, schema.adminPermission.userId)
    )
    .where(
      and(
        eq(schema.user.role, 'admin'),
        eq(schema.user.status, 'active'),
        eq(schema.adminPermission.permissionId, permissionId)
      )
    );

  return adminsWithPerm.length === 1 && adminsWithPerm[0].id === userId;
}

export async function listMedia(params?: {
  status?: 'published' | 'draft' | 'archived';
  mediaType?: 'audio' | 'video';
  categoryId?: string;
  district?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ media: MediaItemData[]; total: number }> {
  const conditions = [];

  if (params?.status) {
    conditions.push(eq(schema.media.status, params.status));
  }
  if (params?.mediaType) {
    conditions.push(eq(schema.media.mediaType, params.mediaType));
  }
  if (params?.categoryId) {
    conditions.push(eq(schema.media.categoryId, params.categoryId));
  }
  if (params?.district) {
    conditions.push(eq(schema.media.district, params.district));
  }
  if (params?.search) {
    const q = `%${params.search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(schema.media.title, q),
        ilike(schema.media.speaker, q),
        ilike(schema.media.description, q),
        ilike(schema.media.district, q)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRes] = await db
    .select({ count: count() })
    .from(schema.media)
    .where(whereClause);

  const total = Number(countRes?.count || 0);
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  const rows = await db
    .select()
    .from(schema.media)
    .where(whereClause)
    .orderBy(desc(schema.media.createdAt))
    .limit(limit)
    .offset(offset);

  const mediaList: MediaItemData[] = rows.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    speaker: m.speaker,
    speakerTitle: m.speakerTitle,
    categoryId: m.categoryId,
    categoryLabel: m.categoryLabel,
    mediaType: m.mediaType as 'audio' | 'video',
    duration: m.duration,
    durationSeconds: m.durationSeconds,
    storageKey: m.storageKey,
    storageUrl: m.storageUrl,
    thumbnailKey: m.thumbnailKey,
    thumbnailUrl: m.thumbnailUrl,
    fileSize: m.fileSize ?? 0,
    mimeType: m.mimeType,
    location: m.location,
    district: m.district,
    language: m.language,
    tags: (m.tags as string[]) || [],
    keyTakeaways: (m.keyTakeaways as string[]) || [],
    status: m.status as 'published' | 'draft' | 'archived',
    isFeatured: m.isFeatured,
    createdBy: m.createdBy,
    updatedBy: m.updatedBy,
    archivedAt: m.archivedAt,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  return { media: mediaList, total };
}

export async function getMediaById(id: string): Promise<MediaItemData | null> {
  const [m] = await db
    .select()
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);

  if (!m) return null;

  return {
    id: m.id,
    title: m.title,
    description: m.description,
    speaker: m.speaker,
    speakerTitle: m.speakerTitle,
    categoryId: m.categoryId,
    categoryLabel: m.categoryLabel,
    mediaType: m.mediaType as 'audio' | 'video',
    duration: m.duration,
    durationSeconds: m.durationSeconds,
    storageKey: m.storageKey,
    storageUrl: m.storageUrl,
    thumbnailKey: m.thumbnailKey,
    thumbnailUrl: m.thumbnailUrl,
    fileSize: m.fileSize ?? 0,
    mimeType: m.mimeType,
    location: m.location,
    district: m.district,
    language: m.language,
    tags: (m.tags as string[]) || [],
    keyTakeaways: (m.keyTakeaways as string[]) || [],
    status: m.status as 'published' | 'draft' | 'archived',
    isFeatured: m.isFeatured,
    createdBy: m.createdBy,
    updatedBy: m.updatedBy,
    archivedAt: m.archivedAt,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export async function createMedia(
  data: Omit<MediaItemData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MediaItemData> {
  const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  const [created] = await db
    .insert(schema.media)
    .values({
      id,
      title: data.title,
      description: data.description,
      speaker: data.speaker,
      speakerTitle: data.speakerTitle,
      categoryId: data.categoryId,
      categoryLabel: data.categoryLabel,
      mediaType: data.mediaType,
      duration: data.duration,
      durationSeconds: data.durationSeconds,
      storageKey: data.storageKey,
      storageUrl: data.storageUrl,
      thumbnailKey: data.thumbnailKey || null,
      thumbnailUrl: data.thumbnailUrl || null,
      fileSize: data.fileSize || 0,
      mimeType: data.mimeType,
      location: data.location,
      district: data.district,
      language: data.language,
      tags: data.tags || [],
      keyTakeaways: data.keyTakeaways || [],
      status: data.status || 'published',
      isFeatured: data.isFeatured || false,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy || null,
      archivedAt: data.archivedAt || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const result: MediaItemData = {
    id: created.id,
    title: created.title,
    description: created.description,
    speaker: created.speaker,
    speakerTitle: created.speakerTitle,
    categoryId: created.categoryId,
    categoryLabel: created.categoryLabel,
    mediaType: created.mediaType as 'audio' | 'video',
    duration: created.duration,
    durationSeconds: created.durationSeconds,
    storageKey: created.storageKey,
    storageUrl: created.storageUrl,
    thumbnailKey: created.thumbnailKey,
    thumbnailUrl: created.thumbnailUrl,
    fileSize: created.fileSize ?? 0,
    mimeType: created.mimeType,
    location: created.location,
    district: created.district,
    language: created.language,
    tags: (created.tags as string[]) || [],
    keyTakeaways: (created.keyTakeaways as string[]) || [],
    status: created.status as 'published' | 'draft' | 'archived',
    isFeatured: created.isFeatured,
    createdBy: created.createdBy,
    updatedBy: created.updatedBy,
    archivedAt: created.archivedAt,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return result;
}

export async function updateMedia(
  id: string,
  updates: Partial<Omit<MediaItemData, 'id' | 'createdAt' | 'createdBy'>>
): Promise<MediaItemData> {
  const now = new Date();

  const [updated] = await db
    .update(schema.media)
    .set({
      ...updates,
      updatedAt: now,
    })
    .where(eq(schema.media.id, id))
    .returning();

  if (!updated) {
    throw new Error('Media item not found');
  }

  const result: MediaItemData = {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    speaker: updated.speaker,
    speakerTitle: updated.speakerTitle,
    categoryId: updated.categoryId,
    categoryLabel: updated.categoryLabel,
    mediaType: updated.mediaType as 'audio' | 'video',
    duration: updated.duration,
    durationSeconds: updated.durationSeconds,
    storageKey: updated.storageKey,
    storageUrl: updated.storageUrl,
    thumbnailKey: updated.thumbnailKey,
    thumbnailUrl: updated.thumbnailUrl,
    fileSize: updated.fileSize ?? 0,
    mimeType: updated.mimeType,
    location: updated.location,
    district: updated.district,
    language: updated.language,
    tags: (updated.tags as string[]) || [],
    keyTakeaways: (updated.keyTakeaways as string[]) || [],
    status: updated.status as 'published' | 'draft' | 'archived',
    isFeatured: updated.isFeatured,
    createdBy: updated.createdBy,
    updatedBy: updated.updatedBy,
    archivedAt: updated.archivedAt,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return result;
}

export async function archiveMedia(id: string): Promise<MediaItemData> {
  const now = new Date();

  const [archived] = await db
    .update(schema.media)
    .set({
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    })
    .where(eq(schema.media.id, id))
    .returning();

  if (!archived) throw new Error('Media item not found');

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return {
    id: archived.id,
    title: archived.title,
    description: archived.description,
    speaker: archived.speaker,
    speakerTitle: archived.speakerTitle,
    categoryId: archived.categoryId,
    categoryLabel: archived.categoryLabel,
    mediaType: archived.mediaType as 'audio' | 'video',
    duration: archived.duration,
    durationSeconds: archived.durationSeconds,
    storageKey: archived.storageKey,
    storageUrl: archived.storageUrl,
    thumbnailKey: archived.thumbnailKey,
    thumbnailUrl: archived.thumbnailUrl,
    fileSize: archived.fileSize ?? 0,
    mimeType: archived.mimeType,
    location: archived.location,
    district: archived.district,
    language: archived.language,
    tags: (archived.tags as string[]) || [],
    keyTakeaways: (archived.keyTakeaways as string[]) || [],
    status: 'archived',
    isFeatured: archived.isFeatured,
    createdBy: archived.createdBy,
    updatedBy: archived.updatedBy,
    archivedAt: archived.archivedAt,
    createdAt: archived.createdAt,
    updatedAt: archived.updatedAt,
  };
}

export async function restoreMedia(id: string): Promise<MediaItemData> {
  const now = new Date();

  const [restored] = await db
    .update(schema.media)
    .set({
      status: 'published',
      archivedAt: null,
      updatedAt: now,
    })
    .where(eq(schema.media.id, id))
    .returning();

  if (!restored) throw new Error('Media item not found');

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return {
    id: restored.id,
    title: restored.title,
    description: restored.description,
    speaker: restored.speaker,
    speakerTitle: restored.speakerTitle,
    categoryId: restored.categoryId,
    categoryLabel: restored.categoryLabel,
    mediaType: restored.mediaType as 'audio' | 'video',
    duration: restored.duration,
    durationSeconds: restored.durationSeconds,
    storageKey: restored.storageKey,
    storageUrl: restored.storageUrl,
    thumbnailKey: restored.thumbnailKey,
    thumbnailUrl: restored.thumbnailUrl,
    fileSize: restored.fileSize ?? 0,
    mimeType: restored.mimeType,
    location: restored.location,
    district: restored.district,
    language: restored.language,
    tags: (restored.tags as string[]) || [],
    keyTakeaways: (restored.keyTakeaways as string[]) || [],
    status: 'published',
    isFeatured: restored.isFeatured,
    createdBy: restored.createdBy,
    updatedBy: restored.updatedBy,
    archivedAt: restored.archivedAt,
    createdAt: restored.createdAt,
    updatedAt: restored.updatedAt,
  };
}

export async function deleteMedia(id: string): Promise<void> {
  await db.delete(schema.media).where(eq(schema.media.id, id));
  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);
}

// =========================================================================
// Invitation Data Operations
// =========================================================================

export async function listInvitations(): Promise<InvitationData[]> {
  const rows = await db
    .select()
    .from(schema.invitation)
    .orderBy(desc(schema.invitation.createdAt));

  return rows.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role as 'admin' | 'listener',
    permissions: (inv.permissions as PermissionId[]) || [],
    invitedBy: inv.invitedBy,
    token: inv.token,
    expiresAt: inv.expiresAt,
    status: inv.status as 'pending' | 'accepted' | 'expired' | 'revoked',
    acceptedAt: inv.acceptedAt,
    revokedAt: inv.revokedAt,
    message: inv.message,
    createdAt: inv.createdAt,
  }));
}

export async function createInvitation(data: {
  email: string;
  role: 'admin' | 'listener';
  permissions: PermissionId[];
  invitedBy: string;
  message?: string;
}): Promise<InvitationData> {
  const id = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const token = `tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  const now = new Date();
  const expiresAt = new Date(Date.now() + 86400000 * 7);

  const [created] = await db
    .insert(schema.invitation)
    .values({
      id,
      email: data.email.trim().toLowerCase(),
      role: data.role,
      permissions: data.role === 'admin' ? data.permissions : [],
      invitedBy: data.invitedBy,
      token,
      expiresAt,
      status: 'pending',
      message: data.message || null,
      createdAt: now,
    })
    .returning();

  return {
    id: created.id,
    email: created.email,
    role: created.role as 'admin' | 'listener',
    permissions: (created.permissions as PermissionId[]) || [],
    invitedBy: created.invitedBy,
    token: created.token,
    expiresAt: created.expiresAt,
    status: created.status as 'pending' | 'accepted' | 'expired' | 'revoked',
    acceptedAt: created.acceptedAt,
    revokedAt: created.revokedAt,
    message: created.message,
    createdAt: created.createdAt,
  };
}

export async function revokeInvitation(id: string): Promise<InvitationData> {
  const [revoked] = await db
    .update(schema.invitation)
    .set({
      status: 'revoked',
      revokedAt: new Date(),
    })
    .where(eq(schema.invitation.id, id))
    .returning();

  if (!revoked) throw new Error('Invitation not found');

  return {
    id: revoked.id,
    email: revoked.email,
    role: revoked.role as 'admin' | 'listener',
    permissions: (revoked.permissions as PermissionId[]) || [],
    invitedBy: revoked.invitedBy,
    token: revoked.token,
    expiresAt: revoked.expiresAt,
    status: 'revoked',
    acceptedAt: revoked.acceptedAt,
    revokedAt: revoked.revokedAt,
    message: revoked.message,
    createdAt: revoked.createdAt,
  };
}

export async function resendInvitation(id: string): Promise<InvitationData> {
  const token = `tok_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  const expiresAt = new Date(Date.now() + 86400000 * 7);

  const [resent] = await db
    .update(schema.invitation)
    .set({
      token,
      expiresAt,
      status: 'pending',
    })
    .where(eq(schema.invitation.id, id))
    .returning();

  if (!resent) throw new Error('Invitation not found');

  return {
    id: resent.id,
    email: resent.email,
    role: resent.role as 'admin' | 'listener',
    permissions: (resent.permissions as PermissionId[]) || [],
    invitedBy: resent.invitedBy,
    token: resent.token,
    expiresAt: resent.expiresAt,
    status: 'pending',
    acceptedAt: resent.acceptedAt,
    revokedAt: resent.revokedAt,
    message: resent.message,
    createdAt: resent.createdAt,
  };
}

// =========================================================================
// Audit Log Data Operations
// =========================================================================

export async function listAuditLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogData[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  const [countRes] = await db
    .select({ count: count() })
    .from(schema.auditLog);

  const total = Number(countRes?.count || 0);

  const rows = await db
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  const logs: AuditLogData[] = rows.map((l) => ({
    id: l.id,
    actorId: l.actorId,
    actorEmail: l.actorEmail,
    actorName: l.actorName,
    action: l.action,
    targetType: l.targetType as 'user' | 'admin' | 'media' | 'invitation',
    targetId: l.targetId,
    targetSummary: l.targetSummary,
    details: (l.details as Record<string, unknown>) || {},
    ipAddress: l.ipAddress,
    status: l.status as 'success' | 'failure',
    createdAt: l.createdAt,
  }));

  return { logs, total };
}

export async function createAuditLog(
  entry: Omit<AuditLogData, 'id' | 'createdAt'>
): Promise<AuditLogData> {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  const [created] = await db
    .insert(schema.auditLog)
    .values({
      id,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorName: entry.actorName,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      targetSummary: entry.targetSummary,
      details: entry.details,
      ipAddress: entry.ipAddress || null,
      status: entry.status || 'success',
      createdAt: now,
    })
    .returning();

  const newLog: AuditLogData = {
    id: created.id,
    actorId: created.actorId,
    actorEmail: created.actorEmail,
    actorName: created.actorName,
    action: created.action,
    targetType: created.targetType as 'user' | 'admin' | 'media' | 'invitation',
    targetId: created.targetId,
    targetSummary: created.targetSummary,
    details: (created.details as Record<string, unknown>) || {},
    ipAddress: created.ipAddress,
    status: created.status as 'success' | 'failure',
    createdAt: created.createdAt,
  };

  broadcastAuditLog(newLog);

  const currentStats = await getDashboardStats();
  broadcastStatsUpdate(currentStats);

  return newLog;
}

// =========================================================================
// Real-time Platform Stats (Database Queries)
// =========================================================================

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  totalAdmins: number;
  totalListeners: number;
  totalPublishedMedia: number;
  totalArchivedMedia: number;
  totalDraftMedia: number;
}> {
  const [
    [usersCount],
    [adminsCount],
    [listenersCount],
    [publishedMediaCount],
    [archivedMediaCount],
    [draftMediaCount],
  ] = await Promise.all([
    db.select({ count: count() }).from(schema.user),
    db.select({ count: count() }).from(schema.user).where(eq(schema.user.role, 'admin')),
    db.select({ count: count() }).from(schema.user).where(eq(schema.user.role, 'listener')),
    db.select({ count: count() }).from(schema.media).where(eq(schema.media.status, 'published')),
    db.select({ count: count() }).from(schema.media).where(eq(schema.media.status, 'archived')),
    db.select({ count: count() }).from(schema.media).where(eq(schema.media.status, 'draft')),
  ]);

  return {
    totalUsers: Number(usersCount?.count || 0),
    totalAdmins: Number(adminsCount?.count || 0),
    totalListeners: Number(listenersCount?.count || 0),
    totalPublishedMedia: Number(publishedMediaCount?.count || 0),
    totalArchivedMedia: Number(archivedMediaCount?.count || 0),
    totalDraftMedia: Number(draftMediaCount?.count || 0),
  };
}

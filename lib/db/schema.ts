import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. Better Auth Core Tables
// ==========================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').default('listener').notNull(), // 'admin' | 'listener'
  status: text('status').default('active').notNull(), // 'active' | 'suspended' | 'pending'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 2. Granular Permissions & Admin Assignments
// ==========================================

export const permission = pgTable('permission', {
  id: text('id').primaryKey(), // e.g. 'users.create', 'media.upload'
  category: text('category').notNull(), // 'User Management', 'Media Management', 'Administrator Management'
  name: text('name').notNull(),
  description: text('description').notNull(),
});

export const adminPermission = pgTable('admin_permission', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id')
    .notNull()
    .references(() => permission.id, { onDelete: 'cascade' }),
  grantedBy: text('granted_by').references(() => user.id),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
});

// ==========================================
// 3. User & Administrator Invitations
// ==========================================

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  role: text('role').default('listener').notNull(), // 'admin' | 'listener'
  permissions: json('permissions').$type<string[]>().default([]).notNull(), // JSON array of permission ids
  invitedBy: text('invited_by')
    .notNull()
    .references(() => user.id),
  token: text('token').notNull().unique(), // Secure hashed token
  expiresAt: timestamp('expires_at').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'accepted' | 'expired' | 'revoked'
  acceptedAt: timestamp('accepted_at'),
  revokedAt: timestamp('revoked_at'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 4. Media Management Table
// ==========================================

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  speaker: text('speaker').notNull(),
  speakerTitle: text('speaker_title').notNull(),
  categoryId: text('category_id').notNull(), // 'preachings' | 'khutbahs' | 'lectures' | 'recitations' | 'reminders'
  categoryLabel: text('category_label').notNull(),
  mediaType: text('media_type').notNull(), // 'audio' | 'video'
  duration: text('duration').notNull(), // '28:40'
  durationSeconds: integer('duration_seconds').notNull(),
  storageKey: text('storage_key').notNull(),
  storageUrl: text('storage_url').notNull(),
  thumbnailKey: text('thumbnail_key'),
  thumbnailUrl: text('thumbnail_url'),
  fileSize: integer('file_size').default(0), // bytes
  mimeType: text('mime_type').notNull(),
  location: text('location').notNull(),
  district: text('district').notNull(),
  language: text('language').notNull(),
  tags: json('tags').$type<string[]>().default([]).notNull(),
  keyTakeaways: json('key_takeaways').$type<string[]>().default([]).notNull(),
  status: text('status').default('published').notNull(), // 'published' | 'draft' | 'archived'
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  updatedBy: text('updated_by').references(() => user.id),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 5. Audit Log Table
// ==========================================

export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull(),
  actorEmail: text('actor_email').notNull(),
  actorName: text('actor_name').notNull(),
  action: text('action').notNull(), // e.g. 'user.created', 'media.uploaded', 'admin.permissions_updated'
  targetType: text('target_type').notNull(), // 'user' | 'admin' | 'media' | 'invitation'
  targetId: text('target_id').notNull(),
  targetSummary: text('target_summary').notNull(),
  details: json('details').$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: text('ip_address'),
  status: text('status').default('success').notNull(), // 'success' | 'failure'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

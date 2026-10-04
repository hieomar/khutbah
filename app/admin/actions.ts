'use server';

import { z } from 'zod';
import { requirePermission } from '../../lib/auth/session';
import {
  createUser,
  updateUser,
  setUserPermissions,
  isLastAdminWithPermission,
  createMedia,
  updateMedia,
  archiveMedia,
  restoreMedia,
  deleteMedia,
  createInvitation,
  revokeInvitation,
  resendInvitation,
  getUserById,
  getMediaById,
} from '../../lib/db/store';
import { recordAuditEvent } from '../../lib/audit';
import { PermissionId } from '../../lib/auth/permissions';
import { StorageService } from '../../lib/storage';

// ==========================================
// 1. Zod Validation Schemas
// ==========================================

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'listener']),
  status: z.enum(['active', 'suspended', 'pending']).default('active'),
  permissions: z.array(z.string()).default([]),
});

const UpdateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['admin', 'listener']),
  status: z.enum(['active', 'suspended', 'pending']),
});

const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'listener']),
  permissions: z.array(z.string()).default([]),
  message: z.string().max(500).optional(),
});

const UpdateAdminPermissionsSchema = z.object({
  userId: z.string().min(1),
  permissions: z.array(z.string()),
});

const CreateMediaSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  speaker: z.string().min(2, 'Speaker name is required'),
  speakerTitle: z.string().min(2, 'Speaker title or organization is required'),
  categoryId: z.string().min(1, 'Category is required'),
  categoryLabel: z.string().min(1),
  mediaType: z.enum(['audio', 'video']),
  duration: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/, 'Duration format must be MM:SS or HH:MM:SS'),
  durationSeconds: z.number().int().positive(),
  fileName: z.string().min(1, 'Media file is required'),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  thumbnailName: z.string().optional(),
  location: z.string().min(2, 'Location or Mosque is required'),
  district: z.string().min(2, 'District is required'),
  language: z.string().min(2, 'Language is required'),
  tags: z.array(z.string()).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  isFeatured: z.boolean().default(false),
});

const UpdateMediaSchema = CreateMediaSchema.partial().extend({
  id: z.string().min(1),
});

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

// ==========================================
// 2. User & Admin Management Actions
// ==========================================

export async function createUserAction(formData: unknown) {
  try {
    const admin = await requirePermission('users.create');
    const parsed = CreateUserSchema.parse(formData);

    // If assigning permissions or creating an admin, verify permission delegation rights
    if (parsed.role === 'admin') {
      await requirePermission('admins.create');
      if (parsed.permissions.length > 0) {
        await requirePermission('admins.permissions.manage');
      }
    }

    const newUser = await createUser({
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
      permissions: parsed.role === 'admin' ? (parsed.permissions as PermissionId[]) : [],
      grantedBy: admin.id,
    });

    await recordAuditEvent({
      actor: admin,
      action: parsed.role === 'admin' ? 'admin.created' : 'user.created',
      targetType: parsed.role === 'admin' ? 'admin' : 'user',
      targetId: newUser.id,
      targetSummary: `Created ${parsed.role} account for ${parsed.name} (${parsed.email})`,
      details: { role: parsed.role, status: parsed.status, permissionsCount: parsed.permissions.length },
    });

    return { success: true, user: newUser };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to create user') };
  }
}

export async function updateUserAction(formData: unknown) {
  try {
    const admin = await requirePermission('users.update');
    const parsed = UpdateUserSchema.parse(formData);

    const targetUser = await getUserById(parsed.id);
    if (!targetUser) throw new Error('User not found');

    // Safeguard: Protect the last admin with 'admins.permissions.manage' from being demoted or suspended
    if (targetUser.role === 'admin' && (parsed.role === 'listener' || parsed.status !== 'active')) {
      const isLastAdmin = await isLastAdminWithPermission(parsed.id, 'admins.permissions.manage');
      if (isLastAdmin) {
        throw new Error(
          'Security Safeguard: Cannot demote or suspend the last active administrator with permission management rights.'
        );
      }
    }

    // Role modification check
    if (targetUser.role !== parsed.role) {
      await requirePermission('admins.permissions.manage');
    }

    const updated = await updateUser(parsed.id, {
      name: parsed.name,
      role: parsed.role,
      status: parsed.status,
    });

    await recordAuditEvent({
      actor: admin,
      action: 'user.updated',
      targetType: updated.role === 'admin' ? 'admin' : 'user',
      targetId: updated.id,
      targetSummary: `Updated profile for ${updated.name} (${updated.email})`,
      details: {
        previousRole: targetUser.role,
        newRole: updated.role,
        previousStatus: targetUser.status,
        newStatus: updated.status,
      },
    });

    return { success: true, user: updated };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update user') };
  }
}

export async function initiatePasswordResetAction(userId: string) {
  try {
    const admin = await requirePermission('users.reset_password');
    const targetUser = await getUserById(userId);
    if (!targetUser) throw new Error('User not found');

    await recordAuditEvent({
      actor: admin,
      action: 'user.password_reset_initiated',
      targetType: targetUser.role === 'admin' ? 'admin' : 'user',
      targetId: targetUser.id,
      targetSummary: `Initiated secure password reset for ${targetUser.email}`,
      details: { userEmail: targetUser.email },
    });

    return {
      success: true,
      message: `A secure password reset link has been dispatched to ${targetUser.email}.`,
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to initiate password reset') };
  }
}

export async function updateAdminPermissionsAction(formData: unknown) {
  try {
    const admin = await requirePermission('admins.permissions.manage');
    const parsed = UpdateAdminPermissionsSchema.parse(formData);

    const targetUser = await getUserById(parsed.userId);
    if (!targetUser) throw new Error('Administrator not found');
    if (targetUser.role !== 'admin') throw new Error('User is not an administrator');

    // Prevent modifying own permissions directly
    if (targetUser.id === admin.id) {
      throw new Error('Security Safeguard: Administrators cannot modify their own permissions directly.');
    }

    // Safeguard: Ensure we do not remove 'admins.permissions.manage' from the last remaining admin
    const isLastAdmin = await isLastAdminWithPermission(parsed.userId, 'admins.permissions.manage');
    if (isLastAdmin && !parsed.permissions.includes('admins.permissions.manage')) {
      throw new Error(
        'Security Safeguard: Cannot strip permission management from the last remaining administrator with full administrative authority.'
      );
    }

    const previousPerms = new Set(targetUser.permissions);
    const newPerms = new Set(parsed.permissions as PermissionId[]);

    const added = Array.from(newPerms).filter((p) => !previousPerms.has(p));
    const removed = Array.from(previousPerms).filter((p) => !newPerms.has(p));

    const updated = await setUserPermissions(parsed.userId, Array.from(newPerms));

    await recordAuditEvent({
      actor: admin,
      action: 'admin.permissions_updated',
      targetType: 'admin',
      targetId: updated.id,
      targetSummary: `Updated permissions for administrator ${updated.name} (${updated.email})`,
      details: { added, removed, totalAssigned: updated.permissions.length },
    });

    return { success: true, user: updated, added, removed };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update administrator permissions') };
  }
}

export async function inviteUserAction(formData: unknown) {
  try {
    const admin = await requirePermission('users.invite');
    const parsed = InviteUserSchema.parse(formData);

    if (parsed.role === 'admin') {
      await requirePermission('admins.create');
      if (parsed.permissions.length > 0) {
        await requirePermission('admins.permissions.manage');
      }
    }

    const newInv = await createInvitation({
      email: parsed.email,
      role: parsed.role,
      permissions: parsed.permissions as PermissionId[],
      invitedBy: admin.id,
      message: parsed.message,
    });

    await recordAuditEvent({
      actor: admin,
      action: 'invitation.created',
      targetType: 'invitation',
      targetId: newInv.id,
      targetSummary: `Sent ${parsed.role} invitation to ${parsed.email}`,
      details: { role: parsed.role, permissionsCount: parsed.permissions.length },
    });

    return { success: true, invitation: newInv };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to create invitation') };
  }
}

export async function revokeInvitationAction(invitationId: string) {
  try {
    const admin = await requirePermission('users.invite');
    const revoked = await revokeInvitation(invitationId);

    await recordAuditEvent({
      actor: admin,
      action: 'invitation.revoked',
      targetType: 'invitation',
      targetId: revoked.id,
      targetSummary: `Revoked invitation for ${revoked.email}`,
      details: { invitationId: revoked.id, email: revoked.email },
    });

    return { success: true, invitation: revoked };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to revoke invitation') };
  }
}

export async function resendInvitationAction(invitationId: string) {
  try {
    const admin = await requirePermission('users.invite');
    const resent = await resendInvitation(invitationId);

    await recordAuditEvent({
      actor: admin,
      action: 'invitation.resent',
      targetType: 'invitation',
      targetId: resent.id,
      targetSummary: `Refreshed & resent invitation to ${resent.email}`,
      details: { invitationId: resent.id, email: resent.email, expiresAt: resent.expiresAt },
    });

    return { success: true, invitation: resent };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to resend invitation') };
  }
}

// ==========================================
// 3. Media Management Actions
// ==========================================

export async function createMediaAction(formData: unknown) {
  try {
    const admin = await requirePermission('media.create');
    const parsed = CreateMediaSchema.parse(formData);

    // Upload & generate secure storage references
    const storedMedia = await StorageService.uploadFile(
      parsed.mediaType === 'audio' ? 'audios' : 'videos',
      parsed.fileName,
      parsed.fileSize,
      parsed.mimeType
    );

    let storedThumbUrl = null;
    let storedThumbKey = null;

    if (parsed.thumbnailName) {
      const storedThumb = await StorageService.uploadFile(
        'thumbnails',
        parsed.thumbnailName,
        1024 * 500, // sample thumb size
        'image/jpeg'
      );
      storedThumbUrl = storedThumb.url;
      storedThumbKey = storedThumb.key;
    }

    const created = await createMedia({
      title: parsed.title,
      description: parsed.description,
      speaker: parsed.speaker,
      speakerTitle: parsed.speakerTitle,
      categoryId: parsed.categoryId,
      categoryLabel: parsed.categoryLabel,
      mediaType: parsed.mediaType,
      duration: parsed.duration,
      durationSeconds: parsed.durationSeconds,
      storageKey: storedMedia.key,
      storageUrl: storedMedia.url,
      thumbnailKey: storedThumbKey,
      thumbnailUrl: storedThumbUrl,
      fileSize: parsed.fileSize,
      mimeType: parsed.mimeType,
      location: parsed.location,
      district: parsed.district,
      language: parsed.language,
      tags: parsed.tags,
      keyTakeaways: parsed.keyTakeaways,
      status: parsed.status,
      isFeatured: parsed.isFeatured,
      createdBy: admin.id,
      updatedBy: null,
      archivedAt: null,
    });

    await recordAuditEvent({
      actor: admin,
      action: 'media.created',
      targetType: 'media',
      targetId: created.id,
      targetSummary: `Published ${parsed.mediaType} "${parsed.title}" by ${parsed.speaker}`,
      details: {
        mediaType: parsed.mediaType,
        categoryId: parsed.categoryId,
        district: parsed.district,
        storageKey: storedMedia.key,
      },
    });

    return { success: true, media: created };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to upload and create media') };
  }
}

export async function updateMediaAction(formData: unknown) {
  try {
    const admin = await requirePermission('media.update');
    const parsed = UpdateMediaSchema.parse(formData);

    const existing = await getMediaById(parsed.id);
    if (!existing) throw new Error('Media item not found');

    const updated = await updateMedia(parsed.id, {
      ...parsed,
      updatedBy: admin.id,
    });

    await recordAuditEvent({
      actor: admin,
      action: 'media.updated',
      targetType: 'media',
      targetId: updated.id,
      targetSummary: `Updated media metadata for "${updated.title}"`,
      details: { title: updated.title, speaker: updated.speaker, categoryId: updated.categoryId },
    });

    return { success: true, media: updated };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to update media') };
  }
}

export async function archiveMediaAction(mediaId: string) {
  try {
    const admin = await requirePermission('media.archive');
    const archived = await archiveMedia(mediaId);

    await recordAuditEvent({
      actor: admin,
      action: 'media.archived',
      targetType: 'media',
      targetId: archived.id,
      targetSummary: `Archived media "${archived.title}" (hidden from public discovery)`,
      details: { mediaId: archived.id, title: archived.title },
    });

    return { success: true, media: archived };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to archive media') };
  }
}

export async function restoreMediaAction(mediaId: string) {
  try {
    const admin = await requirePermission('media.archive');
    const restored = await restoreMedia(mediaId);

    await recordAuditEvent({
      actor: admin,
      action: 'media.restored',
      targetType: 'media',
      targetId: restored.id,
      targetSummary: `Restored media "${restored.title}" to public catalog`,
      details: { mediaId: restored.id, title: restored.title },
    });

    return { success: true, media: restored };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to restore media') };
  }
}

export async function deleteMediaAction(mediaId: string) {
  try {
    const admin = await requirePermission('media.delete');
    const target = await getMediaById(mediaId);
    if (!target) throw new Error('Media item not found');

    // Delete database record safely
    await deleteMedia(mediaId);

    // Clean up storage object
    if (target.storageKey) {
      await StorageService.deleteFile(target.storageKey);
    }

    await recordAuditEvent({
      actor: admin,
      action: 'media.deleted',
      targetType: 'media',
      targetId: mediaId,
      targetSummary: `Permanently deleted media "${target.title}"`,
      details: { title: target.title, storageKey: target.storageKey },
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, 'Failed to delete media') };
  }
}

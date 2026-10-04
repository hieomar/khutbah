import { createAuditLog, AuditLogData } from '../db/store';

export type AuditActionType =
  | 'user.created'
  | 'user.updated'
  | 'user.password_reset_initiated'
  | 'user.invited'
  | 'user.deleted'
  | 'admin.created'
  | 'admin.permissions_updated'
  | 'media.created'
  | 'media.updated'
  | 'media.archived'
  | 'media.restored'
  | 'media.deleted'
  | 'invitation.created'
  | 'invitation.revoked'
  | 'invitation.resent';

export interface RecordAuditParams {
  actor: {
    id: string;
    email: string;
    name: string;
  };
  action: AuditActionType;
  targetType: 'user' | 'admin' | 'media' | 'invitation';
  targetId: string;
  targetSummary: string;
  details?: Record<string, unknown>;
  status?: 'success' | 'failure';
  ipAddress?: string;
}

/**
 * Sanitizes details to ensure passwords, tokens, or secrets are NEVER recorded.
 */
function sanitizeAuditDetails(details: Record<string, unknown> = {}): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const forbiddenKeys = [
    'password',
    'pass',
    'token',
    'secret',
    'auth_secret',
    'apiKey',
    'authorization',
    'cookie',
  ];

  for (const [key, value] of Object.entries(details)) {
    const isForbidden = forbiddenKeys.some((fk) => key.toLowerCase().includes(fk.toLowerCase()));
    if (!isForbidden) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Records an immutable audit log entry.
 */
export async function recordAuditEvent(params: RecordAuditParams): Promise<AuditLogData> {
  return await createAuditLog({
    actorId: params.actor.id,
    actorEmail: params.actor.email,
    actorName: params.actor.name,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    targetSummary: params.targetSummary,
    details: sanitizeAuditDetails(params.details),
    ipAddress: params.ipAddress || null,
    status: params.status || 'success',
  });
}

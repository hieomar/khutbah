import { getSession } from './auth';
import { PermissionId, hasPermission } from './permissions';
import { AdminUserData } from '../db/store';

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required to access this resource') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'You do not have the required permissions to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Server-side guard: Ensures the user is an active Administrator.
 * Listeners and suspended accounts are strictly rejected.
 */
export async function requireAdmin(): Promise<AdminUserData> {
  const session = await getSession();

  if (!session || !session.user) {
    throw new AuthenticationError('You must be signed in to access the admin dashboard');
  }

  const currentUser = session.user;

  if (currentUser.role !== 'admin') {
    throw new AuthorizationError('Access denied: Listener accounts cannot access administrator operations');
  }

  if (currentUser.status !== 'active') {
    throw new AuthorizationError('Access denied: Administrator account is not active');
  }

  return currentUser;
}

/**
 * Server-side guard: Ensures the administrator has the exact required permission.
 * Centralized authorization check conceptually: requirePermission("media.create")
 */
export async function requirePermission(requiredPerm: PermissionId): Promise<AdminUserData> {
  const admin = await requireAdmin();

  const isAuthorized = hasPermission(admin.permissions, requiredPerm);

  if (!isAuthorized) {
    throw new AuthorizationError(
      `Permission denied: Your administrator account lacks the '${requiredPerm}' permission`
    );
  }

  return admin;
}

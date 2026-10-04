export type PermissionId =
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.reset_password'
  | 'users.invite'
  // Media Management
  | 'media.view'
  | 'media.create'
  | 'media.update'
  | 'media.delete'
  | 'media.archive'
  // Administrator Management
  | 'admins.create'
  | 'admins.permissions.manage';

export interface PermissionDefinition {
  id: PermissionId;
  category: 'User Management' | 'Media Management' | 'Administrator Management';
  name: string;
  description: string;
}

export const PERMISSION_CATALOGUE: PermissionDefinition[] = [
  // User Management
  {
    id: 'users.view',
    category: 'User Management',
    name: 'View users',
    description: 'View platform users and search account records',
  },
  {
    id: 'users.create',
    category: 'User Management',
    name: 'Create users',
    description: 'Create new user and listener accounts',
  },
  {
    id: 'users.update',
    category: 'User Management',
    name: 'Update users',
    description: 'Edit user profile information and account status',
  },
  {
    id: 'users.reset_password',
    category: 'User Management',
    name: 'Reset passwords',
    description: 'Initiate secure password reset workflows for users',
  },
  {
    id: 'users.invite',
    category: 'User Management',
    name: 'Invite users',
    description: 'Send expiring invitation links to new platform users',
  },

  // Media Management
  {
    id: 'media.view',
    category: 'Media Management',
    name: 'View media',
    description: 'Browse, inspect, and search audio and video media records',
  },
  {
    id: 'media.create',
    category: 'Media Management',
    name: 'Add media',
    description: 'Upload and publish new audio sermons, khutbahs, and lectures',
  },
  {
    id: 'media.update',
    category: 'Media Management',
    name: 'Update media',
    description: 'Edit media metadata, chapters, speakers, and titles',
  },
  {
    id: 'media.delete',
    category: 'Media Management',
    name: 'Delete media',
    description: 'Permanently remove media and clean up stored objects',
  },
  {
    id: 'media.archive',
    category: 'Media Management',
    name: 'Archive and restore media',
    description: 'Hide media from public discovery or restore archived recordings',
  },

  // Administrator Management
  {
    id: 'admins.create',
    category: 'Administrator Management',
    name: 'Create or invite administrators',
    description: 'Create new administrator accounts or send administrator invites',
  },
  {
    id: 'admins.permissions.manage',
    category: 'Administrator Management',
    name: 'Manage administrator permissions',
    description: 'Assign, modify, or revoke granular permissions for other administrators',
  },
];

export const ALL_PERMISSION_IDS: PermissionId[] = PERMISSION_CATALOGUE.map((p) => p.id);

export const PERMISSIONS_BY_CATEGORY = {
  'User Management': PERMISSION_CATALOGUE.filter((p) => p.category === 'User Management'),
  'Media Management': PERMISSION_CATALOGUE.filter((p) => p.category === 'Media Management'),
  'Administrator Management': PERMISSION_CATALOGUE.filter(
    (p) => p.category === 'Administrator Management'
  ),
};

/**
 * Check if a user's assigned permissions include a required permission.
 */
export function hasPermission(
  assignedPermissions: string[] | undefined | null,
  requiredPermission: PermissionId
): boolean {
  if (!assignedPermissions || !Array.isArray(assignedPermissions)) {
    return false;
  }
  return assignedPermissions.includes(requiredPermission);
}

/**
 * Check if an administrator can delegate a set of permissions.
 * Principle: An administrator cannot grant permissions they do not possess,
 * unless they have 'admins.permissions.manage' and are assigning allowed permissions.
 */
export function canDelegatePermissions(
  granterPermissions: string[],
  requestedPermissions: string[]
): boolean {
  if (!granterPermissions.includes('admins.permissions.manage')) {
    return false;
  }
  // All requested permissions must exist in catalogue
  const validCatalogueIds = new Set(ALL_PERMISSION_IDS);
  return requestedPermissions.every(
    (p) => validCatalogueIds.has(p as PermissionId) && granterPermissions.includes(p)
  );
}

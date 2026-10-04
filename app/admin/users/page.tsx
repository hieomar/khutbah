import React from 'react';
import { requirePermission } from '../../../lib/auth/session';
import { listUsers } from '../../../lib/db/store';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const admin = await requirePermission('users.view');
  const { users } = await listUsers({ limit: 100 });

  return <UsersClient initialUsers={users} currentUser={admin} />;
}

import React from 'react';
import { requirePermission } from '../../../lib/auth/session';
import { listAdmins } from '../../../lib/db/store';
import AdminsClient from './AdminsClient';

export default async function AdminAdminsPage() {
  const admin = await requirePermission('admins.permissions.manage');
  const admins = await listAdmins();

  return <AdminsClient initialAdmins={admins} currentUser={admin} />;
}

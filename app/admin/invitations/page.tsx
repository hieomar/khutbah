import React from 'react';
import { requirePermission } from '../../../lib/auth/session';
import { listInvitations } from '../../../lib/db/store';
import InvitationsClient from './InvitationsClient';

export default async function AdminInvitationsPage() {
  const admin = await requirePermission('users.invite');
  const invitations = await listInvitations();

  return <InvitationsClient initialInvitations={invitations} currentUser={admin} />;
}

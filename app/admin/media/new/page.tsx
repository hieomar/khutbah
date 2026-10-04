import React from 'react';
import { requirePermission } from '../../../../lib/auth/session';
import NewMediaClient from './NewMediaClient';

export default async function AdminNewMediaPage() {
  await requirePermission('media.create');
  return <NewMediaClient />;
}

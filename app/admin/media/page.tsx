import React from 'react';
import { requirePermission } from '../../../lib/auth/session';
import { listMedia } from '../../../lib/db/store';
import MediaClient from './MediaClient';

export default async function AdminMediaPage() {
  const admin = await requirePermission('media.view');
  const { media } = await listMedia({
    limit: 100,
    mosqueId: admin.role === 'mosque' ? (admin.mosqueId ?? undefined) : undefined,
  });

  return <MediaClient initialMedia={media} currentUser={admin} />;
}

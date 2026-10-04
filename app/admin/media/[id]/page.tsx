import React from 'react';
import { notFound } from 'next/navigation';
import { requirePermission } from '../../../../lib/auth/session';
import { getMediaById } from '../../../../lib/db/store';
import EditMediaClient from './EditMediaClient';

export default async function AdminEditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission('media.update');
  const { id } = await params;
  const media = await getMediaById(id);

  if (!media) {
    notFound();
  }

  return <EditMediaClient media={media} />;
}

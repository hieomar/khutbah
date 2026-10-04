import React from 'react';
import { requireAdmin } from '../../../lib/auth/session';
import { listAuditLogs } from '../../../lib/db/store';
import AuditLogsClient from './AuditLogsClient';

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const { logs } = await listAuditLogs({ limit: 100 });

  return <AuditLogsClient initialLogs={logs} />;
}

import React from 'react';
import { getDashboardStats, listAuditLogs } from '../../lib/db/store';
import { requireAdmin } from '../../lib/auth/session';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();
  const { logs } = await listAuditLogs({ limit: 15 });

  return (
    <AdminDashboardClient
      currentUser={admin}
      initialStats={stats}
      initialLogs={logs}
    />
  );
}

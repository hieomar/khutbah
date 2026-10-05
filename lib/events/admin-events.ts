import { EventEmitter } from 'events';
import type { AuditLogData } from '../db/store';

export interface DashboardStatsData {
  totalUsers: number;
  totalAdmins: number;
  totalListeners: number;
  totalPublishedMedia: number;
  totalArchivedMedia: number;
  totalDraftMedia: number;
}

export type AdminSSEPayload =
  | {
      type: 'init';
      stats: DashboardStatsData;
      logs: AuditLogData[];
      timestamp: string;
    }
  | {
      type: 'stats';
      stats: DashboardStatsData;
      timestamp: string;
    }
  | {
      type: 'audit';
      log: AuditLogData;
      timestamp: string;
    }
  | {
      type: 'ping';
      timestamp: number;
    };

// Global singleton EventEmitter to ensure it persists across hot reloads in Next.js
declare global {
   
  var __adminEventEmitter: EventEmitter | undefined;
}

export const adminEventEmitter: EventEmitter =
  globalThis.__adminEventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__adminEventEmitter = adminEventEmitter;
}

// Set max listeners to accommodate multiple admin dashboard tabs
adminEventEmitter.setMaxListeners(100);

export const ADMIN_EVENT_TYPES = {
  STATS: 'admin:stats',
  AUDIT: 'admin:audit',
} as const;

export function broadcastStatsUpdate(stats: DashboardStatsData) {
  adminEventEmitter.emit(ADMIN_EVENT_TYPES.STATS, {
    type: 'stats',
    stats,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastAuditLog(log: AuditLogData) {
  adminEventEmitter.emit(ADMIN_EVENT_TYPES.AUDIT, {
    type: 'audit',
    log,
    timestamp: new Date().toISOString(),
  });
}

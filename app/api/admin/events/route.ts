import { NextRequest } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import { getDashboardStats, listAuditLogs } from '../../../../lib/db/store';
import {
  adminEventEmitter,
  ADMIN_EVENT_TYPES,
  AdminSSEPayload,
} from '../../../../lib/events/admin-events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Authenticate administrator
    await requireAdmin();
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized administrative session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeEnqueue = (message: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          isClosed = true;
        }
      };

      const formatSSE = (data: AdminSSEPayload) => {
        return `data: ${JSON.stringify(data)}\n\n`;
      };

      // 1. Send initial state payload with real data
      try {
        const stats = await getDashboardStats();
        const { logs } = await listAuditLogs({ limit: 15 });
        const initPayload: AdminSSEPayload = {
          type: 'init',
          stats,
          logs,
          timestamp: new Date().toISOString(),
        };
        safeEnqueue(formatSSE(initPayload));
      } catch (err) {
        console.error('Error fetching initial SSE data:', err);
      }

      // 2. Set up event listeners
      const onStatsUpdate = (payload: AdminSSEPayload) => {
        safeEnqueue(formatSSE(payload));
      };

      const onAuditLog = (payload: AdminSSEPayload) => {
        safeEnqueue(formatSSE(payload));
      };

      adminEventEmitter.on(ADMIN_EVENT_TYPES.STATS, onStatsUpdate);
      adminEventEmitter.on(ADMIN_EVENT_TYPES.AUDIT, onAuditLog);

      // 3. Heartbeat ping every 15s to keep the SSE connection alive
      const pingInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(pingInterval);
          return;
        }
        const pingPayload: AdminSSEPayload = {
          type: 'ping',
          timestamp: Date.now(),
        };
        safeEnqueue(formatSSE(pingPayload));
      }, 15000);

      // 4. Cleanup when client disconnects
      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(pingInterval);
        adminEventEmitter.off(ADMIN_EVENT_TYPES.STATS, onStatsUpdate);
        adminEventEmitter.off(ADMIN_EVENT_TYPES.AUDIT, onAuditLog);
        try {
          controller.close();
        } catch {
          // stream might already be closed
        }
      };

      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

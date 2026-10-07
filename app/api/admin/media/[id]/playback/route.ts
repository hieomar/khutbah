import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/session';
import { getMediaPlayback } from '@/lib/db/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('media.view');
    const { id } = await params;

    const playback = await getMediaPlayback(id);

    if (!playback) {
      return NextResponse.json(
        { error: 'Media recording not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mediaUrl: playback.mediaUrl,
      thumbnailUrl: playback.thumbnailUrl,
      expiresAt: playback.expiresAt,
    });
  } catch (error: unknown) {
    console.error('Playback URL generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate playback URL';
    const status = message.includes('denied') || message.includes('Permission') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

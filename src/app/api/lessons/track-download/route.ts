import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/lessons/track-download
// Body: { noteId: string }
export async function POST(req: NextRequest) {
  try {
    const { noteId } = await req.json();
    if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 });

    const updated = await prisma.lessonNote.update({
      where: { id: noteId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });
    return NextResponse.json({ downloadCount: updated.downloadCount });
  } catch (err: any) {
    console.error('[track-download]', err);
    return NextResponse.json({ error: err?.message || 'Failed.' }, { status: 500 });
  }
}

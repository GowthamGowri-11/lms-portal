import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── GET /api/admin/lessons/resources?lessonId=xxx ──────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 });

  const resources = await prisma.lessonResource.findMany({
    where: { lessonId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ resources });
}

// ── POST /api/admin/lessons/resources ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, type, description, lessonId, courseId } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!url?.trim()) return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: 'lessonId required.' }, { status: 400 });

    const resource = await prisma.lessonResource.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        type: type || 'External URL',
        description: description || '',
        lessonId,
        courseId: courseId || '',
      },
    });
    return NextResponse.json({ resource }, { status: 201 });
  } catch (err: any) {
    console.error('[resources post]', err);
    return NextResponse.json({ error: err?.message || 'Create failed.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/lessons/resources ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, url, type, description } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.lessonResource.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
      },
    });
    return NextResponse.json({ resource: updated });
  } catch (err: any) {
    console.error('[resources patch]', err);
    return NextResponse.json({ error: err?.message || 'Update failed.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/lessons/resources ───────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.lessonResource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[resources delete]', err);
    return NextResponse.json({ error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloudinary, ALLOWED_TYPES, MAX_FILE_SIZE, getResourceType, getFileTypeLabel } from '@/lib/cloudinary';

export const runtime = 'nodejs';

// ── GET /api/admin/lessons/practice-files?lessonId=xxx ─────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 });

  const files = await prisma.lessonPracticeFile.findMany({
    where: { lessonId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ files });
}

// ── POST /api/admin/lessons/practice-files  (multipart/form-data) ───────────
export async function POST(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const form = await req.formData();
    const file        = form.get('file') as File | null;
    const title       = (form.get('title') as string) || '';
    const description = (form.get('description') as string) || '';
    const type        = (form.get('type') as string) || 'Starter Code';
    const lessonId    = (form.get('lessonId') as string) || '';
    const courseId    = (form.get('courseId') as string) || '';

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: 'lessonId required.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" is not allowed.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 200 MB size limit.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = getResourceType(file.type);
    const folder = `GM-Training/Developers/Courses/Lessons/Resources`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
        (error, result) => { if (error) reject(error); else resolve(result); },
      );
      stream.end(buffer);
    });

    const practiceFile = await prisma.lessonPracticeFile.create({
      data: {
        title: title || file.name,
        description,
        type,
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType: getFileTypeLabel(file.type),
        mimeType: file.type,
        fileSize: file.size,
        lessonId,
        courseId,
      },
    });
    return NextResponse.json({ file: practiceFile }, { status: 201 });
  } catch (err: any) {
    console.error('[practice-files post]', err);
    return NextResponse.json({ error: err?.message || 'Upload failed.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/lessons/practice-files ─────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, type } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.lessonPracticeFile.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
      },
    });
    return NextResponse.json({ file: updated });
  } catch (err: any) {
    console.error('[practice-files patch]', err);
    return NextResponse.json({ error: err?.message || 'Update failed.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/lessons/practice-files ────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const record = await prisma.lessonPracticeFile.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    await cld.uploader.destroy(record.publicId, { resource_type: getResourceType(record.mimeType) });
    await prisma.lessonPracticeFile.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[practice-files delete]', err);
    return NextResponse.json({ error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}

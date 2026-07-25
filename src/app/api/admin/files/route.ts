import { NextRequest, NextResponse } from 'next/server';
import {
  getCloudinary, ALLOWED_TYPES, MAX_FILE_SIZE,
  getResourceType, getFileTypeLabel,
} from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// ── GET /api/admin/files?lessonId=xxx ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  const courseId = searchParams.get('courseId');

  const where: Record<string, unknown> = {};
  if (lessonId) where.lessonId = lessonId;
  if (courseId) where.courseId = courseId;

  const files = await prisma.lessonFile.findMany({
    where,
    orderBy: { uploadedAt: 'desc' },
  });
  return NextResponse.json({ files });
}

// ── DELETE /api/admin/files ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const record = await prisma.lessonFile.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    await cld.uploader.destroy(record.publicId, {
      resource_type: getResourceType(record.mimeType),
    });
    await prisma.lessonFile.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed.';
    console.error('[files delete]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH /api/admin/files — replace file or update metadata ──────────────────
export async function PATCH(req: NextRequest) {
  try {
    const cld  = getCloudinary();
    const form = await req.formData();

    const id          = form.get('id') as string;
    const title       = form.get('title') as string | null;
    const description = form.get('description') as string | null;
    const newFile     = form.get('file') as File | null;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const record = await prisma.lessonFile.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    let updateData: Record<string, unknown> = {};
    if (title       !== null) updateData.title       = title;
    if (description !== null) updateData.description = description;

    if (newFile) {
      if (!ALLOWED_TYPES.includes(newFile.type))
        return NextResponse.json({ error: `File type "${newFile.type}" not allowed.` }, { status: 400 });
      if (newFile.size > MAX_FILE_SIZE)
        return NextResponse.json({ error: 'File exceeds 200 MB limit.' }, { status: 400 });

      // Delete old asset from Cloudinary
      await cld.uploader.destroy(record.publicId, {
        resource_type: getResourceType(record.mimeType),
      });

      // Upload new asset
      const buffer       = Buffer.from(await newFile.arrayBuffer());
      const resourceType = getResourceType(newFile.type);
      const folder       = record.publicId.substring(0, record.publicId.lastIndexOf('/'));

      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cld.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (err, res) => { if (err || !res) reject(err); else resolve(res as any); },
          );
          stream.end(buffer);
        },
      );

      updateData = {
        ...updateData,
        secureUrl: uploadResult.secure_url,
        publicId:  uploadResult.public_id,
        fileType:  getFileTypeLabel(newFile.type),
        mimeType:  newFile.type,
        fileSize:  newFile.size,
      };
    }

    const updated = await prisma.lessonFile.update({ where: { id }, data: updateData });
    return NextResponse.json({ file: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed.';
    console.error('[files patch]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

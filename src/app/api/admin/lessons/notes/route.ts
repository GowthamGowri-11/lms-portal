import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getCloudinary,
  MAX_FILE_SIZE,
  getResourceType,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Allowed MIME types for notes
const NOTES_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
];

function getNoteFileTypeLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx';
  if (mimeType.includes('word')) return 'docx';
  if (mimeType.includes('zip')) return 'zip';
  if (mimeType === 'text/plain') return 'txt';
  return 'file';
}

// ── GET /api/admin/lessons/notes?lessonId=xxx ─────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 });

  const notes = await prisma.lessonNote.findMany({
    where: { lessonId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ notes });
}

// ── POST /api/admin/lessons/notes  (multipart/form-data) ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const form = await req.formData();
    const file         = form.get('file') as File | null;
    const title        = (form.get('title') as string) || '';
    const description  = (form.get('description') as string) || '';
    const category     = (form.get('category') as string) || 'Theory';
    const visibility   = (form.get('visibility') as string) || 'Public';
    const studentAccess = (form.get('studentAccess') as string) || 'Everyone';
    const uploadedBy   = (form.get('uploadedBy') as string) || 'Admin';
    const lessonId     = (form.get('lessonId') as string) || '';
    const courseId     = (form.get('courseId') as string) || '';
    const parentId     = (form.get('parentId') as string) || null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: 'lessonId required.' }, { status: 400 });
    if (!NOTES_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" is not supported for notes.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 200 MB size limit.' }, { status: 400 });
    }

    // Determine version number
    let version = 1;
    if (parentId) {
      const existingVersions = await prisma.lessonNote.count({ where: { parentId } });
      version = existingVersions + 2; // parent is v1, each child increments
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = getResourceType(file.type);
    const folder = `ATLYX/Developers/Courses/Lessons/Notes/${getNoteFileTypeLabel(file.type).toUpperCase()}`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
        (error, result) => { if (error) reject(error); else resolve(result); },
      );
      stream.end(buffer);
    });

    const note = await prisma.lessonNote.create({
      data: {
        title: title || file.name,
        description,
        category,
        visibility,
        studentAccess,
        uploadedBy,
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType: getNoteFileTypeLabel(file.type),
        mimeType: file.type,
        fileSize: file.size,
        version,
        parentId: parentId || null,
        lessonId,
        courseId,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (err: any) {
    console.error('[notes upload]', err);
    return NextResponse.json({ error: err?.message || 'Upload failed.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/lessons/notes  (JSON — update metadata only) ─────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, category, visibility, studentAccess } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.lessonNote.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(visibility !== undefined && { visibility }),
        ...(studentAccess !== undefined && { studentAccess }),
      },
    });
    return NextResponse.json({ note: updated });
  } catch (err: any) {
    console.error('[notes patch]', err);
    return NextResponse.json({ error: err?.message || 'Update failed.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/lessons/notes ──────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const record = await prisma.lessonNote.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    // Remove from Cloudinary
    await cld.uploader.destroy(record.publicId, { resource_type: getResourceType(record.mimeType) });
    await prisma.lessonNote.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[notes delete]', err);
    return NextResponse.json({ error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}

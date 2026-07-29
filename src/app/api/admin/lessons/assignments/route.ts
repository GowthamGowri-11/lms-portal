import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloudinary, MAX_FILE_SIZE, getResourceType } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const ASSIGNMENT_ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
];

function getAssignmentFileType(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word')) return 'docx';
  if (mimeType.includes('zip')) return 'zip';
  return 'file';
}

// ── GET /api/admin/lessons/assignments?lessonId=xxx ─────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 });

  const assignments = await prisma.lessonAssignment.findMany({
    where: { lessonId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ assignments });
}

// ── POST /api/admin/lessons/assignments  (multipart/form-data) ──────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file         = form.get('file') as File | null;
    const title        = (form.get('title') as string) || '';
    const description  = (form.get('description') as string) || '';
    const instructions = (form.get('instructions') as string) || '';
    const deadline     = (form.get('deadline') as string) || '';
    const maxMarks     = parseInt((form.get('maxMarks') as string) || '100', 10);
    const lessonId     = (form.get('lessonId') as string) || '';
    const courseId     = (form.get('courseId') as string) || '';

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: 'lessonId required.' }, { status: 400 });

    let secureUrl = '';
    let publicId  = '';
    let fileType  = '';
    let mimeType  = '';
    let fileSize  = 0;

    if (file) {
      if (!ASSIGNMENT_ALLOWED.includes(file.type)) {
        return NextResponse.json({ error: `File type "${file.type}" is not allowed for assignments.` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File exceeds the 200 MB size limit.' }, { status: 400 });
      }

      const cld = getCloudinary();
      const buffer = Buffer.from(await file.arrayBuffer());
      const folder = `ATLYX/Developers/Courses/Lessons/Assignments`;

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cld.uploader.upload_stream(
          { folder, resource_type: getResourceType(file.type), use_filename: true, unique_filename: true },
          (error, result) => { if (error) reject(error); else resolve(result); },
        );
        stream.end(buffer);
      });

      secureUrl = uploadResult.secure_url;
      publicId  = uploadResult.public_id;
      fileType  = getAssignmentFileType(file.type);
      mimeType  = file.type;
      fileSize  = file.size;
    }

    const assignment = await prisma.lessonAssignment.create({
      data: {
        title: title.trim(),
        description,
        instructions,
        deadline: deadline ? new Date(deadline) : null,
        maxMarks: isNaN(maxMarks) ? 100 : maxMarks,
        secureUrl,
        publicId,
        fileType,
        mimeType,
        fileSize,
        lessonId,
        courseId,
      },
    });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err: any) {
    console.error('[assignments post]', err);
    return NextResponse.json({ error: err?.message || 'Create failed.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/lessons/assignments  (JSON — update metadata) ──────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, instructions, deadline, maxMarks } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.lessonAssignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(maxMarks !== undefined && { maxMarks: Number(maxMarks) }),
      },
    });
    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    console.error('[assignments patch]', err);
    return NextResponse.json({ error: err?.message || 'Update failed.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/lessons/assignments ────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const record = await prisma.lessonAssignment.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    // Remove PDF from Cloudinary if uploaded
    if (record.publicId) {
      try {
        const cld = getCloudinary();
        await cld.uploader.destroy(record.publicId, { resource_type: getResourceType(record.mimeType) });
      } catch {
        // Non-fatal if Cloudinary cleanup fails
      }
    }
    await prisma.lessonAssignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[assignments delete]', err);
    return NextResponse.json({ error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}

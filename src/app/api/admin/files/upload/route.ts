import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary, ALLOWED_TYPES, MAX_FILE_SIZE, getResourceType, getFileTypeLabel } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const form = await req.formData();
    const file        = form.get('file') as File | null;
    const title       = (form.get('title') as string) || '';
    const description = (form.get('description') as string) || '';
    const lessonId    = (form.get('lessonId') as string) || null;
    const courseId    = (form.get('courseId') as string) || '';

    // ── Validation ────────────────────────────────────────────────
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" is not allowed.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 200 MB size limit.' }, { status: 400 });
    }

    // ── Convert File → Buffer ─────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    const resourceType = getResourceType(file.type);
    const folder       = `lms/${courseId || 'general'}/${lessonId || 'misc'}`;

    // ── Upload to Cloudinary ──────────────────────────────────────
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          // For raw files (PDF/DOCX/PPT), allow inline viewing in browser
          ...(resourceType === 'raw' ? { flags: 'attachment:false' } : {}),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    // ── Save metadata to DB ───────────────────────────────────────
    const saved = await prisma.lessonFile.create({
      data: {
        title:       title || file.name,
        description,
        secureUrl:   uploadResult.secure_url,
        publicId:    uploadResult.public_id,
        fileType:    getFileTypeLabel(file.type),
        mimeType:    file.type,
        fileSize:    file.size,
        lessonId:    lessonId || null,
        courseId:    courseId || '',
      },
    });

    return NextResponse.json({ file: saved }, { status: 201 });
  } catch (err: any) {
    console.error('[upload]', err);
    return NextResponse.json(
      { error: err?.message || 'Upload failed.' },
      { status: 500 },
    );
  }
}

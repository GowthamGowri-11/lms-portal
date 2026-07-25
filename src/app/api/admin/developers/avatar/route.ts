/**
 * POST   /api/admin/developers/avatar  — upload a profile photo to Cloudinary
 * DELETE /api/admin/developers/avatar  — delete old photo from Cloudinary
 *
 * Credentials read from env vars at request time via getCloudinary().
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES    = 5 * 1024 * 1024; // 5 MB
const FOLDER       = 'indra-lms/developers';

// ── POST: upload new avatar ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Configure Cloudinary at request time — env vars are definitely loaded here
    const cld = getCloudinary();

    // Debug log (server-side only)
    console.log('[dev-avatar] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('[dev-avatar] api_key   :', process.env.CLOUDINARY_API_KEY);
    console.log('[dev-avatar] api_secret:', process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET ⚠️');

    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file)
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    if (!ALLOWED_MIME.includes(file.type))
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 },
      );

    if (file.size > MAX_BYTES)
      return NextResponse.json(
        { error: `Image must be smaller than ${MAX_BYTES / 1024 / 1024} MB.` },
        { status: 400 },
      );

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cld.uploader.upload_stream(
          { folder: FOLDER, resource_type: 'image' },
          (err, res) => {
            if (err || !res) {
              console.error('[dev-avatar] Cloudinary error:', err);
              reject(err ?? new Error('Cloudinary returned no result'));
            } else {
              resolve(res as { secure_url: string; public_id: string });
            }
          },
        );
        stream.end(buffer);
      },
    );

    console.log('[dev-avatar] ✅ Upload OK:', result.public_id);
    return NextResponse.json(
      { secureUrl: result.secure_url, publicId: result.public_id },
      { status: 201 },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    console.error('[dev-avatar upload error]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE: remove old avatar from Cloudinary ────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const cld = getCloudinary();
    const { publicId } = await req.json();

    if (!publicId)
      return NextResponse.json({ error: 'publicId required.' }, { status: 400 });

    await cld.uploader.destroy(publicId, { resource_type: 'image' });
    console.log('[dev-avatar] 🗑️ Deleted:', publicId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed.';
    console.error('[dev-avatar delete error]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

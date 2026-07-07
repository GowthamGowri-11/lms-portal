/**
 * Cloudinary server-side helpers.
 * Import only in API routes or server actions — never in client components.
 *
 * IMPORTANT: Do NOT call cloudinary.config() at module level.
 * Always call getCloudinary() to get a freshly-configured instance so that
 * process.env values are resolved at request time, not at module-load time.
 */
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

/**
 * Returns the cloudinary v2 instance configured with the current env vars.
 * Call this inside every API route handler, not at the top of the file.
 */
export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure:     true,
  } satisfies ConfigOptions);
  return cloudinary;
}

// ── Allowed file types ────────────────────────────────────────────────────────
export const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

// ── Map MIME type → Cloudinary resource_type ─────────────────────────────────
export function getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'raw';
}

// ── Derive human-readable file type label ────────────────────────────────────
export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word')) return 'docx';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx';
  return 'file';
}

// Keep a default export for backward compat — but this is pre-config'd lazily
export default cloudinary;

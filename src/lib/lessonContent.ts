/**
 * Helper utility to manage multi-content lesson format.
 * Supports:
 * - Rich Markdown text with properly spaced images
 * - Attached Document Files (PDF, PowerPoint PPTX/PPT slides, Word DOCX/DOC documents)
 * 100% backward-compatible with legacy plain markdown string notes.
 *
 * Notes are stored in Lesson.notes (DB column) as plain markdown OR
 * as JSON { isMultiContent, markdown, document } when a file is attached.
 */

export interface LessonDocument {
  url: string;
  name: string;
  type: 'pdf' | 'pptx' | 'docx' | 'image' | 'file';
  size?: number;
  publicId?: string;
  mimeType?: string;
}

export interface LessonContentPayload {
  markdown: string;
  document: LessonDocument | null;
}

/**
 * Determine the document type from file name or MIME type.
 */
export function getDocumentType(fileName: string, mimeType = ''): 'pdf' | 'pptx' | 'docx' | 'image' | 'file' {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (lowerName.endsWith('.pdf') || lowerMime.includes('pdf')) return 'pdf';
  if (
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.ppt') ||
    lowerMime.includes('presentation') ||
    lowerMime.includes('powerpoint')
  ) return 'pptx';
  if (
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    lowerMime.includes('word') ||
    lowerMime.includes('officedocument.wordprocessing')
  ) return 'docx';
  if (
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp') ||
    lowerName.endsWith('.gif') ||
    lowerName.endsWith('.svg') ||
    lowerMime.startsWith('image/')
  ) return 'image';
  return 'file';
}

/**
 * Parse raw lesson notes from the database into a structured LessonContentPayload.
 * If raw string is JSON with isMultiContent, extracts document & markdown.
 * Otherwise, treats the whole string as plain markdown.
 */
export function parseLessonContent(raw: string | null | undefined): LessonContentPayload {
  if (!raw) return { markdown: '', document: null };

  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.isMultiContent || parsed.document !== undefined)) {
        return {
          markdown: typeof parsed.markdown === 'string' ? parsed.markdown : '',
          document: parsed.document || null,
        };
      }
    } catch {
      // JSON parse failed — fallback to raw text
    }
  }

  return { markdown: raw, document: null };
}

/**
 * Serialize LessonContentPayload into a string to be stored in Lesson.notes.
 * If no document attached, returns clean markdown directly (plain text).
 */
export function serializeLessonContent(payload: LessonContentPayload): string {
  if (!payload.document) {
    return payload.markdown || '';
  }

  return JSON.stringify({
    isMultiContent: true,
    markdown: payload.markdown || '',
    document: payload.document,
  });
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Edit3, FileText, Film, ImageIcon,
  FileDown, X, Plus, RefreshCw, Eye, Download,
} from 'lucide-react';
import styles from './FileManager.module.css';

interface LessonFile {
  id: string;
  title: string;
  description: string;
  secureUrl: string;
  publicId: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  lessonId: string | null;
  courseId: string;
  uploadedAt: string;
}

interface FileManagerProps {
  lessonId?: string;
  courseId?: string;
  initialFiles?: LessonFile[];
}

const ACCEPT = [
  'image/jpeg','image/jpg','image/png','image/webp','image/gif',
  'video/mp4','video/webm','video/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
].join(',');

const MAX_MB = 200;

function fileIcon(type: string) {
  if (type === 'image') return <ImageIcon size={18} />;
  if (type === 'video') return <Film size={18} />;
  if (type === 'pdf')   return <FileText size={18} />;
  return <FileDown size={18} />;
}

function formatSize(bytes: number) {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileManager({
  lessonId, courseId, initialFiles = [],
}: FileManagerProps) {
  const [files, setFiles]           = useState<LessonFile[]>(initialFiles);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', file: null as File | null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string, type: 'ok' | 'err') => {
    if (type === 'ok') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else               { setError(msg);   setTimeout(() => setError(''), 4000);   }
  };

  // ── validate client-side ──────────────────────────────────────────────────
  const validate = (f: File): string | null => {
    if (f.size > MAX_MB * 1024 * 1024) return `File exceeds ${MAX_MB} MB limit.`;
    const ok = ACCEPT.split(',').includes(f.type);
    if (!ok) return `File type "${f.type}" is not supported.`;
    return null;
  };

  // ── upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!form.title.trim()) { flash('Please enter a title.', 'err'); return; }
    if (!form.file)         { flash('Please select a file.', 'err'); return; }

    const vErr = validate(form.file);
    if (vErr) { flash(vErr, 'err'); return; }

    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file',        form.file);
      fd.append('title',       form.title);
      fd.append('description', form.description);
      if (lessonId) fd.append('lessonId', lessonId);
      if (courseId) fd.append('courseId', courseId);

      const res  = await fetch('/api/admin/files/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { flash(data.error || 'Upload failed.', 'err'); return; }

      setFiles((prev) => [data.file, ...prev]);
      setForm({ title: '', description: '', file: null });
      setShowForm(false);
      flash('File uploaded successfully!', 'ok');
    } catch {
      flash('Network error during upload.', 'err');
    } finally {
      setUploading(false);
    }
  };

  // ── update metadata or replace file ──────────────────────────────────────
  const handleUpdate = async () => {
    if (!editingId) return;
    if (!form.title.trim()) { flash('Title is required.', 'err'); return; }

    if (form.file) {
      const vErr = validate(form.file);
      if (vErr) { flash(vErr, 'err'); return; }
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('id',          editingId);
      fd.append('title',       form.title);
      fd.append('description', form.description);
      if (form.file) fd.append('file', form.file);

      const res  = await fetch('/api/admin/files', { method: 'PATCH', body: fd });
      const data = await res.json();
      if (!res.ok) { flash(data.error || 'Update failed.', 'err'); return; }

      setFiles((prev) => prev.map((f) => f.id === editingId ? data.file : f));
      setEditingId(null);
      setShowForm(false);
      setForm({ title: '', description: '', file: null });
      flash('File updated successfully!', 'ok');
    } catch {
      flash('Network error during update.', 'err');
    } finally {
      setUploading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.error || 'Delete failed.', 'err'); return; }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      flash('File deleted.', 'ok');
    } catch {
      flash('Network error during delete.', 'err');
    }
  };

  // ── edit open ─────────────────────────────────────────────────────────────
  const openEdit = (f: LessonFile) => {
    setEditingId(f.id);
    setForm({ title: f.title, description: f.description, file: null });
    setShowForm(true);
  };

  // ── drag & drop ───────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setForm((prev) => ({ ...prev, file: f, title: prev.title || f.name }));
      if (!showForm) setShowForm(true);
    }
  }, [showForm]);

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.heading}>
          <FileText size={16} /> Lesson Files
          <span className={styles.count}>{files.length}</span>
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { setEditingId(null); setForm({ title: '', description: '', file: null }); setShowForm(true); }}
        >
          <Plus size={14} /> Upload File
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div className={styles.alertErr} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div className={styles.alertOk} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.formHeader}>
              <span>{editingId ? 'Edit File' : 'Upload File'}</span>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}><X size={16} /></button>
            </div>

            {/* Drag zone */}
            {!editingId && (
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropActive : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={28} />
                <span>{form.file ? form.file.name : 'Drag & drop or click to select'}</span>
                <span className={styles.dropHint}>PDF · DOCX · PPT · Image · Video · Max {MAX_MB} MB</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f) setForm((prev) => ({ ...prev, file: f, title: prev.title || f.name }));
                  }}
                />
              </div>
            )}

            {/* Replace file when editing */}
            {editingId && (
              <div className={styles.replaceRow}>
                <span className={styles.replaceLabel}>Replace file (optional)</span>
                <input
                  type="file"
                  accept={ACCEPT}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setForm((prev) => ({ ...prev, file: f }));
                  }}
                  className={styles.fileInput}
                />
                {form.file && <span className={styles.selectedFile}>{form.file.name}</span>}
              </div>
            )}

            <div className="input-group">
              <label>Title *</label>
              <input
                className="input-field"
                value={form.title}
                placeholder="e.g. Week 1 Lecture Notes"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="input-group" style={{ marginTop: 12 }}>
              <label>Description</label>
              <input
                className="input-field"
                value={form.description}
                placeholder="Optional description"
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className={styles.formActions}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={editingId ? handleUpdate : handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? <><RefreshCw size={14} className={styles.spin} /> {editingId ? 'Updating…' : 'Uploading…'}</>
                  : editingId ? 'Save Changes' : 'Upload'
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {files.length === 0 ? (
        <div className={styles.empty}>No files uploaded yet.</div>
      ) : (
        <div className={styles.fileList}>
          {files.map((f) => (
            <motion.div key={f.id} className={styles.fileRow} layout>
              <div className={styles.fileIcon} data-type={f.fileType}>{fileIcon(f.fileType)}</div>
              <div className={styles.fileMeta}>
                <span className={styles.fileName}>{f.title}</span>
                {f.description && <span className={styles.fileDesc}>{f.description}</span>}
                <span className={styles.fileInfo}>
                  <span className={styles.fileType}>{f.fileType.toUpperCase()}</span>
                  <span>{formatSize(f.fileSize)}</span>
                  <span>{new Date(f.uploadedAt).toLocaleDateString('en-US')}</span>
                </span>
              </div>
              <div className={styles.fileActions}>
                <a href={f.secureUrl} target="_blank" rel="noopener noreferrer" title="Preview/Download">
                  <Eye size={15} />
                </a>
                <a href={f.secureUrl} download title="Download">
                  <Download size={15} />
                </a>
                <button onClick={() => openEdit(f)} title="Edit">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => handleDelete(f.id)} title="Delete" className={styles.deleteBtn}>
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

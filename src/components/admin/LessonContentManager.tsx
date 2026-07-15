'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Link2, ClipboardList, Code2,
  Upload, Trash2, Edit3, X, Plus, RefreshCw,
  Eye, Download, ExternalLink, ChevronDown, ChevronRight,
  BookOpen, GitBranch, Globe, FileCode,
  Film, ImageIcon, FileDown, Calendar, Award,
  AlertCircle, CheckCircle,
} from 'lucide-react';
import styles from './LessonContentManager.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
interface LessonNote {
  id: string; title: string; description: string; category: string;
  visibility: string; studentAccess: string; secureUrl: string;
  publicId: string; fileType: string; mimeType: string; fileSize: number;
  version: number; parentId: string | null; downloadCount: number;
  lastDownloadedAt: string | null; uploadedBy: string;
  lessonId: string; courseId: string; createdAt: string; updatedAt: string;
}

interface LessonResource {
  id: string; title: string; url: string; type: string;
  description: string; lessonId: string; courseId: string; createdAt: string;
}

interface LessonAssignment {
  id: string; title: string; description: string; instructions: string;
  deadline: string | null; maxMarks: number; secureUrl: string;
  publicId: string; fileType: string; mimeType: string; fileSize: number;
  lessonId: string; courseId: string; createdAt: string;
}

interface PracticeFile {
  id: string; title: string; description: string; type: string;
  secureUrl: string; publicId: string; fileType: string; mimeType: string;
  fileSize: number; lessonId: string; courseId: string; createdAt: string;
}

interface Props {
  lessonId: string;
  courseId: string;
  lessonTitle?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const NOTE_CATEGORIES = ['Theory', 'Practical', 'Assignment', 'Cheat Sheet', 'Reference', 'Project'];
const VISIBILITY_OPTIONS = ['Public', 'Private', 'Draft'];
const STUDENT_ACCESS = ['Everyone', 'Only Enrolled Students', 'Only Premium Students'];
const RESOURCE_TYPES = ['GitHub', 'Documentation', 'Official Website', 'Reference', 'YouTube', 'Blog', 'Article', 'Research Paper', 'External URL'];
const PRACTICE_TYPES = ['Starter Code', 'Completed Code', 'ZIP Project', 'Source Code', 'Sample Project'];

const NOTES_ACCEPT = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
].join(',');

const PRACTICE_ACCEPT = [
  'application/pdf',
  'application/zip', 'application/x-zip-compressed',
  'text/plain', 'text/javascript', 'text/html', 'text/css',
  'application/json', 'application/octet-stream',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
].join(',');

const ASSIGNMENT_ACCEPT = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip', 'application/x-zip-compressed',
].join(',');

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type === 'image') return <ImageIcon size={16} />;
  if (type === 'video') return <Film size={16} />;
  if (type === 'pdf') return <FileText size={16} />;
  if (type === 'zip') return <FileCode size={16} />;
  return <FileDown size={16} />;
}

function resourceIcon(type: string) {
  if (type === 'GitHub') return <GitBranch size={15} />;
  if (type === 'YouTube') return <ExternalLink size={15} />;
  if (type === 'Official Website' || type === 'Documentation') return <Globe size={15} />;
  return <ExternalLink size={15} />;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function LessonContentManager({ lessonId, courseId, lessonTitle }: Props) {
  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'assignments' | 'practice'>('notes');

  // ── Notes State ──────────────────────────────────────────────────────────
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<LessonNote | null>(null);
  const [newVersionFor, setNewVersionFor] = useState<LessonNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '', description: '', category: 'Theory',
    visibility: 'Public', studentAccess: 'Everyone',
    file: null as File | null,
  });
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const noteFileRef = useRef<HTMLInputElement>(null);

  // ── Resources State ───────────────────────────────────────────────────────
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: '', url: '', type: 'External URL', description: '',
  });

  // ── Assignments State ──────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<LessonAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<LessonAssignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', instructions: '',
    deadline: '', maxMarks: '100', file: null as File | null,
  });
  const assignmentFileRef = useRef<HTMLInputElement>(null);

  // ── Practice Files State ──────────────────────────────────────────────────
  const [practiceFiles, setPracticeFiles] = useState<PracticeFile[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<PracticeFile | null>(null);
  const [practiceForm, setPracticeForm] = useState({
    title: '', description: '', type: 'Starter Code', file: null as File | null,
  });
  const practiceFileRef = useRef<HTMLInputElement>(null);

  // ── Shared State ──────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const flash = useCallback((msg: string, kind: 'ok' | 'err') => {
    setAlert({ msg, kind });
    setTimeout(() => setAlert(null), 3500);
  }, []);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/admin/lessons/notes?lessonId=${lessonId}`)
      .then(r => r.json()).then(d => setNotes(d.notes || []))
      .finally(() => setNotesLoading(false));
  }, [lessonId]);

  useEffect(() => {
    fetch(`/api/admin/lessons/resources?lessonId=${lessonId}`)
      .then(r => r.json()).then(d => setResources(d.resources || []))
      .finally(() => setResourcesLoading(false));
  }, [lessonId]);

  useEffect(() => {
    fetch(`/api/admin/lessons/assignments?lessonId=${lessonId}`)
      .then(r => r.json()).then(d => setAssignments(d.assignments || []))
      .finally(() => setAssignmentsLoading(false));
  }, [lessonId]);

  useEffect(() => {
    fetch(`/api/admin/lessons/practice-files?lessonId=${lessonId}`)
      .then(r => r.json()).then(d => setPracticeFiles(d.files || []))
      .finally(() => setPracticeLoading(false));
  }, [lessonId]);

  // ── Notes: group by root (version chains) ────────────────────────────────
  const rootNotes = notes.filter(n => !n.parentId);
  const childNotes = (parentId: string) => notes.filter(n => n.parentId === parentId);

  // ── Note Handlers ─────────────────────────────────────────────────────────
  const resetNoteForm = () => {
    setNoteForm({ title: '', description: '', category: 'Theory', visibility: 'Public', studentAccess: 'Everyone', file: null });
    setEditingNote(null);
    setNewVersionFor(null);
    setShowNoteForm(false);
  };

  const handleNoteUpload = async () => {
    if (!noteForm.title.trim()) { flash('Title is required.', 'err'); return; }
    if (!noteForm.file && !editingNote) { flash('Please select a file.', 'err'); return; }
    setUploading(true);
    try {
      if (editingNote) {
        // Metadata-only update
        const res = await fetch('/api/admin/lessons/notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingNote.id,
            title: noteForm.title,
            description: noteForm.description,
            category: noteForm.category,
            visibility: noteForm.visibility,
            studentAccess: noteForm.studentAccess,
          }),
        });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Update failed.', 'err'); return; }
        setNotes(prev => prev.map(n => n.id === editingNote.id ? data.note : n));
        flash('Note updated.', 'ok');
      } else {
        // New upload (or new version)
        const fd = new FormData();
        fd.append('file', noteForm.file!);
        fd.append('title', noteForm.title);
        fd.append('description', noteForm.description);
        fd.append('category', noteForm.category);
        fd.append('visibility', noteForm.visibility);
        fd.append('studentAccess', noteForm.studentAccess);
        fd.append('lessonId', lessonId);
        fd.append('courseId', courseId);
        if (newVersionFor) fd.append('parentId', newVersionFor.parentId || newVersionFor.id);
        const res = await fetch('/api/admin/lessons/notes', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Upload failed.', 'err'); return; }
        setNotes(prev => [data.note, ...prev]);
        flash('Note uploaded successfully.', 'ok');
      }
      resetNoteForm();
    } catch { flash('Network error.', 'err'); }
    finally { setUploading(false); }
  };

  const handleNoteDelete = async (id: string) => {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/lessons/notes', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      if (!res.ok) { flash('Delete failed.', 'err'); return; }
      setNotes(prev => prev.filter(n => n.id !== id));
      flash('Note deleted.', 'ok');
    } catch { flash('Network error.', 'err'); }
  };

  // ── Resource Handlers ─────────────────────────────────────────────────────
  const resetResourceForm = () => {
    setResourceForm({ title: '', url: '', type: 'External URL', description: '' });
    setEditingResource(null);
    setShowResourceForm(false);
  };

  const handleResourceSave = async () => {
    if (!resourceForm.title.trim()) { flash('Title is required.', 'err'); return; }
    if (!resourceForm.url.trim()) { flash('URL is required.', 'err'); return; }
    setUploading(true);
    try {
      if (editingResource) {
        const res = await fetch('/api/admin/lessons/resources', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingResource.id, ...resourceForm }),
        });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Update failed.', 'err'); return; }
        setResources(prev => prev.map(r => r.id === editingResource.id ? data.resource : r));
        flash('Resource updated.', 'ok');
      } else {
        const res = await fetch('/api/admin/lessons/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...resourceForm, lessonId, courseId }),
        });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Create failed.', 'err'); return; }
        setResources(prev => [...prev, data.resource]);
        flash('Resource added.', 'ok');
      }
      resetResourceForm();
    } catch { flash('Network error.', 'err'); }
    finally { setUploading(false); }
  };

  const handleResourceDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const res = await fetch('/api/admin/lessons/resources', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      if (!res.ok) { flash('Delete failed.', 'err'); return; }
      setResources(prev => prev.filter(r => r.id !== id));
      flash('Resource deleted.', 'ok');
    } catch { flash('Network error.', 'err'); }
  };

  // ── Assignment Handlers ───────────────────────────────────────────────────
  const resetAssignmentForm = () => {
    setAssignmentForm({ title: '', description: '', instructions: '', deadline: '', maxMarks: '100', file: null });
    setEditingAssignment(null);
    setShowAssignmentForm(false);
  };

  const handleAssignmentSave = async () => {
    if (!assignmentForm.title.trim()) { flash('Title is required.', 'err'); return; }
    setUploading(true);
    try {
      if (editingAssignment) {
        const res = await fetch('/api/admin/lessons/assignments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAssignment.id,
            title: assignmentForm.title,
            description: assignmentForm.description,
            instructions: assignmentForm.instructions,
            deadline: assignmentForm.deadline || null,
            maxMarks: parseInt(assignmentForm.maxMarks, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Update failed.', 'err'); return; }
        setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? data.assignment : a));
        flash('Assignment updated.', 'ok');
      } else {
        const fd = new FormData();
        fd.append('title', assignmentForm.title);
        fd.append('description', assignmentForm.description);
        fd.append('instructions', assignmentForm.instructions);
        fd.append('deadline', assignmentForm.deadline);
        fd.append('maxMarks', assignmentForm.maxMarks);
        fd.append('lessonId', lessonId);
        fd.append('courseId', courseId);
        if (assignmentForm.file) fd.append('file', assignmentForm.file);
        const res = await fetch('/api/admin/lessons/assignments', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Create failed.', 'err'); return; }
        setAssignments(prev => [...prev, data.assignment]);
        flash('Assignment created.', 'ok');
      }
      resetAssignmentForm();
    } catch { flash('Network error.', 'err'); }
    finally { setUploading(false); }
  };

  const handleAssignmentDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      const res = await fetch('/api/admin/lessons/assignments', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      if (!res.ok) { flash('Delete failed.', 'err'); return; }
      setAssignments(prev => prev.filter(a => a.id !== id));
      flash('Assignment deleted.', 'ok');
    } catch { flash('Network error.', 'err'); }
  };

  // ── Practice File Handlers ────────────────────────────────────────────────
  const resetPracticeForm = () => {
    setPracticeForm({ title: '', description: '', type: 'Starter Code', file: null });
    setEditingPractice(null);
    setShowPracticeForm(false);
  };

  const handlePracticeUpload = async () => {
    if (!practiceForm.title.trim()) { flash('Title is required.', 'err'); return; }
    if (!practiceForm.file && !editingPractice) { flash('Please select a file.', 'err'); return; }
    setUploading(true);
    try {
      if (editingPractice) {
        const res = await fetch('/api/admin/lessons/practice-files', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPractice.id, title: practiceForm.title, description: practiceForm.description, type: practiceForm.type }),
        });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Update failed.', 'err'); return; }
        setPracticeFiles(prev => prev.map(f => f.id === editingPractice.id ? data.file : f));
        flash('Practice file updated.', 'ok');
      } else {
        const fd = new FormData();
        fd.append('file', practiceForm.file!);
        fd.append('title', practiceForm.title);
        fd.append('description', practiceForm.description);
        fd.append('type', practiceForm.type);
        fd.append('lessonId', lessonId);
        fd.append('courseId', courseId);
        const res = await fetch('/api/admin/lessons/practice-files', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) { flash(data.error || 'Upload failed.', 'err'); return; }
        setPracticeFiles(prev => [...prev, data.file]);
        flash('Practice file uploaded.', 'ok');
      }
      resetPracticeForm();
    } catch { flash('Network error.', 'err'); }
    finally { setUploading(false); }
  };

  const handlePracticeDelete = async (id: string) => {
    if (!confirm('Delete this practice file?')) return;
    try {
      const res = await fetch('/api/admin/lessons/practice-files', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      if (!res.ok) { flash('Delete failed.', 'err'); return; }
      setPracticeFiles(prev => prev.filter(f => f.id !== id));
      flash('Practice file deleted.', 'ok');
    } catch { flash('Network error.', 'err'); }
  };

  const onNoteDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setNoteForm(prev => ({ ...prev, file: f, title: prev.title || f.name.replace(/\.[^/.]+$/, '') }));
    if (!showNoteForm) setShowNoteForm(true);
  }, [showNoteForm]);

  // ── Render ────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'notes',       label: 'Notes',          icon: <FileText size={15} />,      count: notes.length },
    { key: 'resources',   label: 'Resources',      icon: <Link2 size={15} />,          count: resources.length },
    { key: 'assignments', label: 'Assignments',    icon: <ClipboardList size={15} />,  count: assignments.length },
    { key: 'practice',   label: 'Practice Files', icon: <Code2 size={15} />,          count: practiceFiles.length },
  ] as const;

  return (
    <div className={styles.manager}>
      {/* Header */}
      <div className={styles.managerHeader}>
        <div className={styles.managerTitle}>
          <BookOpen size={16} />
          <span>Lesson Content</span>
          {lessonTitle && <span className={styles.lessonName}>{lessonTitle}</span>}
        </div>
      </div>

      {/* Alert */}
      <AnimatePresence>
        {alert && (
          <motion.div
            className={alert.kind === 'ok' ? styles.alertOk : styles.alertErr}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            {alert.kind === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {alert.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && <span className={styles.tabBadge}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className={styles.panel}>

        {/* ── NOTES PANEL ───────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div>
            <div className={styles.panelAction}>
              <button className="btn btn-primary btn-sm" onClick={() => { resetNoteForm(); setShowNoteForm(true); }}>
                <Plus size={14} /> Upload Note
              </button>
            </div>

            <AnimatePresence>
              {showNoteForm && (
                <motion.div className={styles.formCard}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className={styles.formHeader}>
                    <span>{editingNote ? 'Edit Note Metadata' : newVersionFor ? `New Version of "${newVersionFor.title}"` : 'Upload Note'}</span>
                    <button onClick={resetNoteForm}><X size={15} /></button>
                  </div>

                  {!editingNote && (
                    <div
                      className={`${styles.dropZone} ${dragOver ? styles.dropActive : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onNoteDrop}
                      onClick={() => noteFileRef.current?.click()}
                    >
                      <Upload size={24} />
                      <span>{noteForm.file ? noteForm.file.name : 'Drag & drop or click to select'}</span>
                      <span className={styles.dropHint}>PDF · PPT/PPTX · DOC/DOCX · ZIP · TXT · Max 200 MB</span>
                      <input ref={noteFileRef} type="file" accept={NOTES_ACCEPT} hidden
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) setNoteForm(prev => ({ ...prev, file: f, title: prev.title || f.name.replace(/\.[^/.]+$/, '') }));
                        }} />
                    </div>
                  )}

                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Title *</label>
                      <input className="input-field" value={noteForm.title} placeholder="e.g. Java Basics Notes"
                        onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Description</label>
                      <input className="input-field" value={noteForm.description} placeholder="Optional description"
                        onChange={e => setNoteForm({ ...noteForm, description: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <select className="input-field" value={noteForm.category}
                        onChange={e => setNoteForm({ ...noteForm, category: e.target.value })}>
                        {NOTE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Visibility</label>
                      <select className="input-field" value={noteForm.visibility}
                        onChange={e => setNoteForm({ ...noteForm, visibility: e.target.value })}>
                        {VISIBILITY_OPTIONS.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Student Access</label>
                      <select className="input-field" value={noteForm.studentAccess}
                        onChange={e => setNoteForm({ ...noteForm, studentAccess: e.target.value })}>
                        {STUDENT_ACCESS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button className="btn btn-secondary btn-sm" onClick={resetNoteForm}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleNoteUpload} disabled={uploading}>
                      {uploading ? <><RefreshCw size={13} className={styles.spin} /> {editingNote ? 'Saving…' : 'Uploading…'}</> : editingNote ? 'Save Changes' : 'Upload'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {notesLoading ? (
              <div className={styles.loading}>Loading notes…</div>
            ) : rootNotes.length === 0 ? (
              <div className={styles.empty}>No notes uploaded yet. Click "Upload Note" to add one.</div>
            ) : (
              <div className={styles.itemList}>
                {rootNotes.map(note => {
                  const versions = childNotes(note.id);
                  const allVersions = [note, ...versions];
                  return (
                    <div key={note.id} className={styles.noteGroup}>
                      <div className={styles.noteRow}>
                        <div className={styles.fileIconBox} data-type={note.fileType}>{fileIcon(note.fileType)}</div>
                        <div className={styles.itemMeta}>
                          <div className={styles.itemTitle}>{note.title}</div>
                          <div className={styles.itemSub}>
                            <span className={styles.badge}>{note.fileType.toUpperCase()}</span>
                            <span className={styles.badge} data-kind="cat">{note.category}</span>
                            <span className={styles.badge} data-kind={note.visibility.toLowerCase()}>{note.visibility}</span>
                            <span>{formatSize(note.fileSize)}</span>
                            <span>v{note.version}</span>
                            <span>↓ {note.downloadCount}</span>
                          </div>
                        </div>
                        <div className={styles.itemActions}>
                          {versions.length > 0 && (
                            <button className={styles.actionBtn}
                              onClick={() => setExpandedVersions(prev => {
                                const n = new Set(prev); n.has(note.id) ? n.delete(note.id) : n.add(note.id); return n;
                              })}
                              title="Show versions">
                              <GitBranch size={14} />
                              <span style={{ fontSize: '0.7rem' }}>v{allVersions.length}</span>
                            </button>
                          )}
                          <a href={note.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="Preview"><Eye size={14} /></a>
                          <a href={note.secureUrl} download className={styles.actionBtn} title="Download"><Download size={14} /></a>
                          <button className={styles.actionBtn} title="Add new version"
                            onClick={() => { resetNoteForm(); setNewVersionFor(note); setNoteForm(p => ({ ...p, title: note.title + ' v' + (allVersions.length + 1) })); setShowNoteForm(true); }}>
                            <Plus size={14} />
                          </button>
                          <button className={styles.actionBtn} title="Edit metadata"
                            onClick={() => {
                              setEditingNote(note);
                              setNoteForm({ title: note.title, description: note.description, category: note.category, visibility: note.visibility, studentAccess: note.studentAccess, file: null });
                              setShowNoteForm(true);
                            }}>
                            <Edit3 size={14} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.dangerBtn}`} title="Delete" onClick={() => handleNoteDelete(note.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Version History */}
                      {expandedVersions.has(note.id) && versions.length > 0 && (
                        <div className={styles.versionList}>
                          {versions.map(v => (
                            <div key={v.id} className={styles.versionRow}>
                              <div className={styles.versionLine} />
                              <div className={styles.fileIconBox} data-type={v.fileType} style={{ width: 28, height: 28 }}>{fileIcon(v.fileType)}</div>
                              <div className={styles.itemMeta}>
                                <div className={styles.itemTitle} style={{ fontSize: '0.82rem' }}>{v.title}</div>
                                <div className={styles.itemSub}>
                                  <span className={styles.badge}>v{v.version}</span>
                                  <span>{formatSize(v.fileSize)}</span>
                                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                                  <span>↓ {v.downloadCount}</span>
                                </div>
                              </div>
                              <div className={styles.itemActions}>
                                <a href={v.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}><Eye size={13} /></a>
                                <a href={v.secureUrl} download className={styles.actionBtn}><Download size={13} /></a>
                                <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleNoteDelete(v.id)}><Trash2 size={13} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RESOURCES PANEL ───────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div>
            <div className={styles.panelAction}>
              <button className="btn btn-primary btn-sm" onClick={() => { resetResourceForm(); setShowResourceForm(true); }}>
                <Plus size={14} /> Add Resource
              </button>
            </div>

            <AnimatePresence>
              {showResourceForm && (
                <motion.div className={styles.formCard}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className={styles.formHeader}>
                    <span>{editingResource ? 'Edit Resource' : 'Add Resource'}</span>
                    <button onClick={resetResourceForm}><X size={15} /></button>
                  </div>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Title *</label>
                      <input className="input-field" value={resourceForm.title} placeholder="e.g. Java Docs"
                        onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>URL *</label>
                      <input className="input-field" value={resourceForm.url} placeholder="https://..."
                        onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Type</label>
                      <select className="input-field" value={resourceForm.type}
                        onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}>
                        {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Description</label>
                      <input className="input-field" value={resourceForm.description} placeholder="Optional"
                        onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button className="btn btn-secondary btn-sm" onClick={resetResourceForm}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleResourceSave} disabled={uploading}>
                      {uploading ? <><RefreshCw size={13} className={styles.spin} /> Saving…</> : editingResource ? 'Save Changes' : 'Add Resource'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {resourcesLoading ? (
              <div className={styles.loading}>Loading resources…</div>
            ) : resources.length === 0 ? (
              <div className={styles.empty}>No resources added yet. Click "Add Resource" to add links.</div>
            ) : (
              <div className={styles.itemList}>
                {resources.map(r => (
                  <div key={r.id} className={styles.resourceRow}>
                    <div className={styles.resourceIconBox}>{resourceIcon(r.type)}</div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemTitle}>{r.title}</div>
                      <div className={styles.itemSub}>
                        <span className={styles.badge}>{r.type}</span>
                        {r.description && <span>{r.description}</span>}
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.urlText}>{r.url}</a>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="Open"><ExternalLink size={14} /></a>
                      <button className={styles.actionBtn} title="Edit"
                        onClick={() => { setEditingResource(r); setResourceForm({ title: r.title, url: r.url, type: r.type, description: r.description }); setShowResourceForm(true); }}>
                        <Edit3 size={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.dangerBtn}`} title="Delete" onClick={() => handleResourceDelete(r.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS PANEL ─────────────────────────────────────────── */}
        {activeTab === 'assignments' && (
          <div>
            <div className={styles.panelAction}>
              <button className="btn btn-primary btn-sm" onClick={() => { resetAssignmentForm(); setShowAssignmentForm(true); }}>
                <Plus size={14} /> Add Assignment
              </button>
            </div>

            <AnimatePresence>
              {showAssignmentForm && (
                <motion.div className={styles.formCard}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className={styles.formHeader}>
                    <span>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</span>
                    <button onClick={resetAssignmentForm}><X size={15} /></button>
                  </div>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Title *</label>
                      <input className="input-field" value={assignmentForm.title} placeholder="e.g. OOP Assignment 1"
                        onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Description</label>
                      <input className="input-field" value={assignmentForm.description} placeholder="Brief overview"
                        onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Deadline</label>
                      <input type="datetime-local" className="input-field" value={assignmentForm.deadline}
                        onChange={e => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Maximum Marks</label>
                      <input type="number" className="input-field" value={assignmentForm.maxMarks} min="1"
                        onChange={e => setAssignmentForm({ ...assignmentForm, maxMarks: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Instructions</label>
                      <textarea className="input-field textarea-field" style={{ minHeight: 100 }} value={assignmentForm.instructions}
                        placeholder="Step-by-step instructions for students…"
                        onChange={e => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} />
                    </div>
                    {!editingAssignment && (
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Assignment PDF / Document (optional)</label>
                        <div className={styles.filePickerRow}>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => assignmentFileRef.current?.click()}>
                            <Upload size={13} /> Choose File
                          </button>
                          {assignmentForm.file && <span className={styles.selectedFile}>{assignmentForm.file.name}</span>}
                          <input ref={assignmentFileRef} type="file" accept={ASSIGNMENT_ACCEPT} hidden
                            onChange={e => setAssignmentForm({ ...assignmentForm, file: e.target.files?.[0] ?? null })} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.formActions}>
                    <button className="btn btn-secondary btn-sm" onClick={resetAssignmentForm}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleAssignmentSave} disabled={uploading}>
                      {uploading ? <><RefreshCw size={13} className={styles.spin} /> Saving…</> : editingAssignment ? 'Save Changes' : 'Create'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {assignmentsLoading ? (
              <div className={styles.loading}>Loading assignments…</div>
            ) : assignments.length === 0 ? (
              <div className={styles.empty}>No assignments yet. Click "Add Assignment" to create one.</div>
            ) : (
              <div className={styles.itemList}>
                {assignments.map(a => (
                  <div key={a.id} className={styles.assignmentRow}>
                    <div className={styles.assignmentIconBox}><ClipboardList size={16} /></div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemTitle}>{a.title}</div>
                      <div className={styles.itemSub}>
                        {a.deadline && <span className={styles.badge} data-kind="deadline"><Calendar size={11} /> {new Date(a.deadline).toLocaleDateString()}</span>}
                        <span className={styles.badge}><Award size={11} /> {a.maxMarks} marks</span>
                        {a.description && <span>{a.description}</span>}
                      </div>
                      {a.instructions && <div className={styles.instructions}>{a.instructions.slice(0, 120)}{a.instructions.length > 120 ? '…' : ''}</div>}
                    </div>
                    <div className={styles.itemActions}>
                      {a.secureUrl && (
                        <>
                          <a href={a.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="View PDF"><Eye size={14} /></a>
                          <a href={a.secureUrl} download className={styles.actionBtn} title="Download"><Download size={14} /></a>
                        </>
                      )}
                      <button className={styles.actionBtn} title="Edit"
                        onClick={() => {
                          setEditingAssignment(a);
                          setAssignmentForm({
                            title: a.title, description: a.description, instructions: a.instructions,
                            deadline: a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : '',
                            maxMarks: String(a.maxMarks), file: null,
                          });
                          setShowAssignmentForm(true);
                        }}>
                        <Edit3 size={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.dangerBtn}`} title="Delete" onClick={() => handleAssignmentDelete(a.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRACTICE FILES PANEL ──────────────────────────────────────── */}
        {activeTab === 'practice' && (
          <div>
            <div className={styles.panelAction}>
              <button className="btn btn-primary btn-sm" onClick={() => { resetPracticeForm(); setShowPracticeForm(true); }}>
                <Plus size={14} /> Upload Practice File
              </button>
            </div>

            <AnimatePresence>
              {showPracticeForm && (
                <motion.div className={styles.formCard}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className={styles.formHeader}>
                    <span>{editingPractice ? 'Edit Practice File' : 'Upload Practice File'}</span>
                    <button onClick={resetPracticeForm}><X size={15} /></button>
                  </div>

                  {!editingPractice && (
                    <div className={styles.dropZone} onClick={() => practiceFileRef.current?.click()}>
                      <Upload size={24} />
                      <span>{practiceForm.file ? practiceForm.file.name : 'Drag & drop or click to select'}</span>
                      <span className={styles.dropHint}>ZIP · Source code · PDF · Any file · Max 200 MB</span>
                      <input ref={practiceFileRef} type="file" accept={PRACTICE_ACCEPT} hidden
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) setPracticeForm(prev => ({ ...prev, file: f, title: prev.title || f.name.replace(/\.[^/.]+$/, '') }));
                        }} />
                    </div>
                  )}

                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Title *</label>
                      <input className="input-field" value={practiceForm.title} placeholder="e.g. Starter Code - Module 1"
                        onChange={e => setPracticeForm({ ...practiceForm, title: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Type</label>
                      <select className="input-field" value={practiceForm.type}
                        onChange={e => setPracticeForm({ ...practiceForm, type: e.target.value })}>
                        {PRACTICE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description</label>
                      <input className="input-field" value={practiceForm.description} placeholder="Optional description"
                        onChange={e => setPracticeForm({ ...practiceForm, description: e.target.value })} />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button className="btn btn-secondary btn-sm" onClick={resetPracticeForm}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handlePracticeUpload} disabled={uploading}>
                      {uploading ? <><RefreshCw size={13} className={styles.spin} /> {editingPractice ? 'Saving…' : 'Uploading…'}</> : editingPractice ? 'Save Changes' : 'Upload'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {practiceLoading ? (
              <div className={styles.loading}>Loading practice files…</div>
            ) : practiceFiles.length === 0 ? (
              <div className={styles.empty}>No practice files yet. Click "Upload Practice File" to add one.</div>
            ) : (
              <div className={styles.itemList}>
                {practiceFiles.map(f => (
                  <div key={f.id} className={styles.noteRow}>
                    <div className={styles.fileIconBox} data-type={f.fileType}>{fileIcon(f.fileType)}</div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemTitle}>{f.title}</div>
                      <div className={styles.itemSub}>
                        <span className={styles.badge} data-kind="cat">{f.type}</span>
                        <span className={styles.badge}>{f.fileType.toUpperCase()}</span>
                        <span>{formatSize(f.fileSize)}</span>
                        {f.description && <span>{f.description}</span>}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <a href={f.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn} title="View"><Eye size={14} /></a>
                      <a href={f.secureUrl} download className={styles.actionBtn} title="Download"><Download size={14} /></a>
                      <button className={styles.actionBtn} title="Edit"
                        onClick={() => { setEditingPractice(f); setPracticeForm({ title: f.title, description: f.description, type: f.type, file: null }); setShowPracticeForm(true); }}>
                        <Edit3 size={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.dangerBtn}`} title="Delete" onClick={() => handlePracticeDelete(f.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>{/* end panel */}
    </div>
  );
}

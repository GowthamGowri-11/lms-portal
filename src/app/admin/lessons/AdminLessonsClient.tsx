'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Play, Clock, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/animations/MotionWrappers';
import { Module, Lesson, Course } from '@/generated/prisma/client';
import styles from './lessons.module.css';

type ModuleWithData = Module & {
  course: Pick<Course, 'id' | 'title' | 'logo'>;
  lessons: Lesson[];
};

const emptyLesson = {
  title: '',
  description: '',
  videoUrl: '',
  notes: '',
  duration: '',
  isFree: false,
  order: 0,
};

export default function AdminLessonsClient({ modules }: { modules: ModuleWithData[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState(emptyLesson);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filtered = modules.filter((m) =>
    m.course.title.toLowerCase().includes(search.toLowerCase()) ||
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.lessons.some((l) => l.title.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openAdd = (moduleId: string) => {
    setEditingLesson(null);
    setSelectedModuleId(moduleId);
    setForm({ ...emptyLesson, order: (modules.find((m) => m.id === moduleId)?.lessons.length ?? 0) });
    setShowModal(true);
  };

  const openEdit = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setSelectedModuleId(moduleId);
    setForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      notes: lesson.notes,
      duration: lesson.duration,
      isFree: lesson.isFree,
      order: lesson.order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingLesson) {
        await fetch('/api/admin/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingLesson.id, ...form }),
        });
      } else {
        await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: selectedModuleId, ...form }),
        });
      }
      setShowModal(false);
      window.location.reload();
    } catch { alert('Error saving lesson'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await fetch('/api/admin/lessons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        <FadeInUp>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Lessons</h1>
              <p className={styles.subtitle}>Manage lessons across all courses and modules.</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search courses, modules or lessons..."
              className={`input-field ${styles.searchInput}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </FadeInUp>

        <div className={styles.modulesList}>
          {filtered.map((mod) => (
            <FadeInUp key={mod.id}>
              <div className={styles.moduleCard}>
                <div className={styles.moduleHeader} onClick={() => toggle(mod.id)}>
                  <div className={styles.moduleLeft}>
                    {expanded.has(mod.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className={styles.courseLogo}>
                      <img src={mod.course.logo} alt="" style={{ width: '1em', height: '1em', objectFit: 'contain' }} />
                    </span>
                    <div>
                      <div className={styles.courseTitle}>{mod.course.title}</div>
                      <div className={styles.moduleTitle}>{mod.title}</div>
                    </div>
                  </div>
                  <div className={styles.moduleRight}>
                    <span className={styles.lessonsCount}>{mod.lessons.length} lessons</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); openAdd(mod.id); }}
                    >
                      <Plus size={14} /> Add Lesson
                    </button>
                  </div>
                </div>

                {expanded.has(mod.id) && (
                  <div className={styles.lessonsList}>
                    {mod.lessons.length === 0 && (
                      <div className={styles.emptyLessons}>No lessons yet. Click "Add Lesson" to create one.</div>
                    )}
                    {mod.lessons.map((lesson) => (
                      <div key={lesson.id} className={styles.lessonRow}>
                        <Play size={14} className={styles.lessonIcon} />
                        <div className={styles.lessonInfo}>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          {lesson.duration && (
                            <span className={styles.lessonDur}><Clock size={12} /> {lesson.duration}</span>
                          )}
                          {lesson.isFree && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Free</span>}
                          {lesson.videoUrl && <span className={styles.hasVideo}>Has Video</span>}
                        </div>
                        <div className={styles.lessonActions}>
                          <button className={styles.actionBtn} onClick={() => openEdit(lesson, mod.id)}>
                            <Edit3 size={15} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDelete(lesson.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowModal(false)}
            >
              <motion.div
                className="modal-content"
                style={{ maxWidth: 640 }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label>Lesson Title *</label>
                    <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <input className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Video URL (YouTube or direct)</label>
                    <input className="input-field" value={form.videoUrl} placeholder="https://youtube.com/watch?v=..." onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Duration (e.g. 25 min)</label>
                    <input className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Notes (Markdown supported)</label>
                    <textarea className="input-field textarea-field" style={{ minHeight: 160 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Order</label>
                    <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="isFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
                    <label htmlFor="isFree" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Free Preview Lesson</label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingLesson ? 'Update' : 'Create Lesson')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

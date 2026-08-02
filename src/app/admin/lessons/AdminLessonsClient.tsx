'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Play, Clock, ChevronDown, ChevronRight, Search, Paperclip, ArrowLeft, Layers } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Module, Lesson, Course } from '@/generated/prisma/client';
import LessonContentManager from '@/components/admin/LessonContentManager';
import styles from './lessons.module.css';
import lessonStyles from '@/app/learn/[courseId]/lesson/[lessonId]/lesson.module.css';

type CourseWithData = Course & {
  modules: (Module & {
    lessons: Lesson[];
  })[];
};

const CourseLogo = ({ logo, title }: { logo?: string | null, title: string }) => {
  const [error, setError] = useState(false);
  
  const isInvalid = !logo || logo === 'null' || logo === 'undefined' || logo.trim() === '';
  const isEmoji = !isInvalid && !logo!.startsWith('/') && !logo!.startsWith('http');

  if (isInvalid || error) {
    return (
      <div 
        style={{ 
          width: '2.5rem', 
          height: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(67,56,202,0.15)', 
          color: 'var(--accent-primary)',
          borderRadius: '8px', 
          fontSize: '1.2rem',
          fontWeight: 'bold',
          flexShrink: 0
        }}
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  if (isEmoji) {
    return (
      <div 
        style={{ 
          width: '2.5rem', 
          height: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '8px', 
          fontSize: '1.2rem',
          flexShrink: 0
        }}
      >
        {logo}
      </div>
    );
  }

  return (
    <img 
      src={logo!} 
      alt={title} 
      style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} 
      onError={() => setError(true)}
      ref={(img) => {
        if (img && img.complete && img.naturalWidth === 0) {
          setError(true);
        }
      }}
    />
  );
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

export default function AdminLessonsClient({ courses }: { courses: CourseWithData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Topic generation
  const [numTopics, setNumTopics] = useState<number | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Lesson/Module state
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: 0 });
  const [previewMode, setPreviewMode] = useState(false);
  
  const [filesLessonId, setFilesLessonId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const handleGenerateTopics = async () => {
    if (!selectedCourseId || !numTopics || numTopics <= 0 || numTopics > 20) {
      alert('Please enter a valid number of topics (1-20)');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/modules/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId, count: Number(numTopics) }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to generate topics');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating topics');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleModule = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openAddLesson = (moduleId: string) => {
    setEditingLesson(null);
    setSelectedModuleId(moduleId);
    const moduleItem = selectedCourse?.modules.find(m => m.id === moduleId);
    setLessonForm({ ...emptyLesson, order: moduleItem?.lessons.length ?? 0 });
    setShowLessonModal(true);
  };

  const openEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setSelectedModuleId(moduleId);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      notes: lesson.notes || lesson.description || '',
      duration: lesson.duration,
      isFree: lesson.isFree,
      order: lesson.order,
    });
    setPreviewMode(false);
    setShowLessonModal(true);
  };

  const openEditModule = (mod: Module) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description, order: mod.order });
    setShowModuleModal(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const moduleItem = selectedCourse?.modules.find(m => m.id === selectedModuleId);
      const titleToSave = moduleItem?.title || 'Content';

      if (editingLesson) {
        await fetch('/api/admin/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingLesson.id, ...lessonForm, title: titleToSave }),
        });
      } else {
        await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: selectedModuleId, ...lessonForm, title: titleToSave }),
        });
      }
      setShowLessonModal(false);
      router.refresh();
    } catch { alert('Error saving lesson'); }
    finally { setIsLoading(false); }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingModule) {
        await fetch('/api/admin/modules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingModule.id, ...moduleForm }),
        });
      } else {
        await fetch('/api/admin/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: selectedCourseId, ...moduleForm }),
        });
      }
      setShowModuleModal(false);
      router.refresh();
    } catch { alert('Error saving module'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await fetch('/api/admin/lessons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Delete this entire topic and all its lessons?')) return;
    await fetch('/api/admin/modules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        
        {/* Course Selection View */}
        {!selectedCourseId && (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>Manage Course Content</h1>
                <p className={styles.subtitle}>Select a course to manage its topics and lessons.</p>
              </div>
            </div>

            <FadeInUp delay={0.1}>
              <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className={`input-field ${styles.searchInput}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </FadeInUp>

            <StaggerContainer className={styles.modulesList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id}>
                  <div 
                    className={styles.moduleCard} 
                    style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <CourseLogo logo={course.logo} title={course.title} />
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{course.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {course.modules.length} Topics &bull; {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
              {filteredCourses.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No courses found.
                </div>
              )}
            </StaggerContainer>
          </>
        )}

        {/* Course Detail View (Topics & Lessons) */}
        {selectedCourseId && selectedCourse && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className={styles.header} style={{ marginBottom: '2rem' }}>
              <div>
                <button 
                  onClick={() => setSelectedCourseId(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Back to Courses
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CourseLogo logo={selectedCourse.logo} title={selectedCourse.title} />
                  <div>
                    <h1 className={styles.title} style={{ fontSize: '1.75rem' }}>{selectedCourse.title}</h1>
                    <p className={styles.subtitle}>Manage topics and lessons for this course.</p>
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingModule(null);
                  setModuleForm({ title: '', description: '', order: selectedCourse.modules.length });
                  setShowModuleModal(true);
                }}
              >
                <Plus size={18} /> Add Topic Manually
              </button>
            </div>

            {/* Bulk Generate Topics Wizard */}
            {selectedCourse.modules.length === 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <Layers size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Generate Course Topics</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  How many topics (sections) do you want to create for this course? You can generate up to 20 topics instantly.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    placeholder="e.g. 10"
                    className="input-field"
                    style={{ width: '100px', textAlign: 'center' }}
                    value={numTopics}
                    onChange={(e) => setNumTopics(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleGenerateTopics}
                    disabled={isGenerating || !numTopics}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Topics'}
                  </button>
                </div>
              </div>
            )}

            {/* Topics List */}
            {selectedCourse.modules.length > 0 && (
              <div className={styles.modulesList}>
                {selectedCourse.modules.map((mod) => (
                  <div key={mod.id} className={styles.moduleCard}>
                    <div className={styles.moduleHeader} onClick={() => toggleModule(mod.id)}>
                      <div className={styles.moduleLeft}>
                        {expanded.has(mod.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <div>
                          <div className={styles.moduleTitle} style={{ fontSize: '1.1rem' }}>{mod.title}</div>
                          {mod.description && <div className={styles.courseTitle} style={{ marginTop: 4, textTransform: 'none' }}>{mod.description}</div>}
                        </div>
                      </div>
                      <div className={styles.moduleRight}>
                        <span className={styles.lessonsCount}>{mod.lessons.length} lessons</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); openEditModule(mod); }}
                          style={{ padding: '0 8px' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                          style={{ padding: '0 8px', color: 'var(--accent-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                        {mod.lessons.length > 0 ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => { e.stopPropagation(); openEditLesson(mod.lessons[0], mod.id); }}
                          >
                            <Edit3 size={14} /> Edit Content
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); openAddLesson(mod.id); }}
                          >
                            <Plus size={14} /> Add Content
                          </button>
                        )}
                      </div>
                    </div>

                    {expanded.has(mod.id) && (
                      <div className={styles.lessonsList}>
                        {mod.lessons.length === 0 && (
                          <div className={styles.emptyLessons}>No content yet. Click "Add Content" to create a lesson.</div>
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
                              <button className={styles.actionBtn} onClick={() => openEditLesson(lesson, mod.id)}>
                                <Edit3 size={15} />
                              </button>
                              <button
                                className={styles.actionBtn}
                                title="Manage Files"
                                onClick={() => setFilesLessonId(filesLessonId === lesson.id ? null : lesson.id)}
                              >
                                <Paperclip size={15} />
                              </button>
                              <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDeleteLesson(lesson.id)}>
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Inline Content Manager for this lesson */}
                            {filesLessonId === lesson.id && (
                              <div style={{ padding: '0.75rem 1.5rem 1rem', borderTop: '1px solid var(--glass-border)', width: '100%' }}>
                                <LessonContentManager
                                  lessonId={lesson.id}
                                  courseId={selectedCourse.id}
                                  lessonTitle={lesson.title}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lesson Modal */}
        <AnimatePresence>
          {showLessonModal && (
            <motion.div
              className="modal-overlay"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowLessonModal(false)}
            >
              <motion.div
                className="modal-content"
                style={{ width: '90vw', maxWidth: 1400, background: '#0b0b12', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingLesson ? 'Edit Lesson Content' : 'Add Lesson Content'}</h2>
                  <button className="modal-close" onClick={() => setShowLessonModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleLessonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label>Content (Markdown supported) *</label>
                    <textarea className="input-field textarea-field" style={{ minHeight: 500, maxHeight: '70vh', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: '1.6' }} value={lessonForm.notes} onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })} required placeholder="Write the content for this topic here using Markdown..." />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Order</label>
                      <input type="number" className="input-field" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, marginTop: '1.5rem' }}>
                      <input type="checkbox" id="isFree" checked={lessonForm.isFree} onChange={(e) => setLessonForm({ ...lessonForm, isFree: e.target.checked })} />
                      <label htmlFor="isFree" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Free Preview Lesson</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setPreviewMode(true)}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                    >
                      <Play size={16} /> Visualize Content
                    </button>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (editingLesson ? 'Update' : 'Create Content')}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Overlay Modal */}
        <AnimatePresence>
          {previewMode && (
            <motion.div
              className="modal-overlay"
              style={{ zIndex: 1100, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content"
                style={{ maxWidth: 1000, height: '90vh', background: '#07070a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Play size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Content Preview</h2>
                  </div>
                  <button className="btn btn-primary" onClick={() => setPreviewMode(false)} style={{ padding: '8px 16px', borderRadius: '99px' }}>
                    <ArrowLeft size={16} /> Back to Editor
                  </button>
                </div>
                <div className={lessonStyles.notesBody} style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem' }}>
                  {lessonForm.notes ? (
                    <ReactMarkdown>{lessonForm.notes}</ReactMarkdown>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                      <p>No content written yet.</p>
                      <button className="btn btn-secondary" onClick={() => setPreviewMode(false)} style={{ marginTop: '1rem' }}>Start Writing</button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module Modal */}
        <AnimatePresence>
          {showModuleModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowModuleModal(false)}
            >
              <motion.div
                className="modal-content"
                style={{ maxWidth: 500 }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingModule ? 'Edit Topic' : 'Add Topic'}</h2>
                  <button className="modal-close" onClick={() => setShowModuleModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleModuleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label>Topic Title *</label>
                    <input className="input-field" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} required placeholder="e.g. Introduction to Python" />
                  </div>
                  <div className="input-group">
                    <label>Description (Optional)</label>
                    <input className="input-field" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Order</label>
                    <input type="number" className="input-field" value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModuleModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingModule ? 'Update Topic' : 'Add Topic')}
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

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Play, Clock, ChevronDown, ChevronRight, Search, Paperclip, ArrowLeft, Layers } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Module, Lesson, Course } from '@/generated/prisma/client';
import { parseLessonContent, serializeLessonContent, getDocumentType, LessonDocument } from '@/lib/lessonContent';
import DocumentViewer from '@/components/common/DocumentViewer';
import { FileUp, Image as ImageIcon, FileText, Presentation, CheckCircle2, Upload, Trash } from 'lucide-react';
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
  const [attachedDoc, setAttachedDoc] = useState<LessonDocument | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [contentInputMode, setContentInputMode] = useState<'text' | 'document' | 'both'>('text');
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const imgFileInputRef = useRef<HTMLInputElement>(null);

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
    setAttachedDoc(null);
    setContentInputMode('text');
    setUploadStatusMsg('');
    setPreviewMode(false);
    setShowLessonModal(true);
  };

  const openEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setSelectedModuleId(moduleId);
    const rawContent = lesson.notes || lesson.description || '';
    const parsed = parseLessonContent(rawContent);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      notes: parsed.markdown,
      duration: lesson.duration,
      isFree: lesson.isFree,
      order: lesson.order,
    });
    setAttachedDoc(parsed.document);
    if (parsed.document && parsed.markdown?.trim()) {
      setContentInputMode('both');
    } else if (parsed.document) {
      setContentInputMode('document');
    } else {
      setContentInputMode('text');
    }
    setUploadStatusMsg('');
    setPreviewMode(false);
    setShowLessonModal(true);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    setUploadStatusMsg(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      if (selectedCourseId) formData.append('courseId', selectedCourseId);
      if (editingLesson) formData.append('lessonId', editingLesson.id);

      const res = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      const docType = getDocumentType(file.name, file.type);
      const newDoc: LessonDocument = {
        url: data.file.secureUrl,
        name: file.name,
        type: docType,
        size: file.size,
        mimeType: file.type,
      };
      setAttachedDoc(newDoc);
      setUploadStatusMsg('Document attached successfully!');
      setTimeout(() => setUploadStatusMsg(''), 3500);
    } catch (err: any) {
      console.error('Doc upload error:', err);
      alert(err.message || 'Failed to upload document file');
    } finally {
      setDocUploading(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setUploadStatusMsg(`Uploading image ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      if (selectedCourseId) formData.append('courseId', selectedCourseId);
      if (editingLesson) formData.append('lessonId', editingLesson.id);

      const res = await fetch('/api/admin/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      const imgUrl = data.file.secureUrl;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const markdownImage = `\n\n![${cleanName}](${imgUrl})\n\n`;
      setLessonForm(prev => ({
        ...prev,
        notes: (prev.notes || '') + markdownImage,
      }));
      setUploadStatusMsg('Image inserted successfully!');
      setTimeout(() => setUploadStatusMsg(''), 3500);
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
      if (imgFileInputRef.current) imgFileInputRef.current.value = '';
    }
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

      const serializedNotes = serializeLessonContent({
        markdown: lessonForm.notes || '',
        document: attachedDoc,
      });

      const payload = {
        ...lessonForm,
        notes: serializedNotes,
        title: titleToSave,
      };

      if (editingLesson) {
        await fetch('/api/admin/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingLesson.id, ...payload }),
        });
      } else {
        await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: selectedModuleId, ...payload }),
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
                style={{ width: '92vw', maxWidth: 1400, maxHeight: '92vh', overflowY: 'auto', background: '#0b0b12', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Hidden File Inputs */}
                <input
                  ref={docFileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,image/*"
                  style={{ display: 'none' }}
                  onChange={handleDocUpload}
                />
                <input
                  ref={imgFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageInsert}
                />

                <div className="modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <h2>{editingLesson ? 'Edit Lesson Content' : 'Add Lesson Content'}</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Upload concept documents (PDF, PowerPoint slides, Word DOCX) or compose formatted Markdown notes with images.
                    </p>
                  </div>
                  <button className="modal-close" onClick={() => setShowLessonModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleLessonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                  {/* Content Mode Switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8 }}>
                      <button
                        type="button"
                        onClick={() => setContentInputMode('text')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          borderRadius: 6,
                          border: 'none',
                          background: contentInputMode === 'text' ? 'var(--accent-primary)' : 'transparent',
                          color: contentInputMode === 'text' ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <FileText size={14} /> Markdown Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentInputMode('document')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          borderRadius: 6,
                          border: 'none',
                          background: contentInputMode === 'document' ? 'var(--accent-primary)' : 'transparent',
                          color: contentInputMode === 'document' ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Presentation size={14} /> Document (PDF / PPT / Word)
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentInputMode('both')}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          borderRadius: 6,
                          border: 'none',
                          background: contentInputMode === 'both' ? 'var(--accent-primary)' : 'transparent',
                          color: contentInputMode === 'both' ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Layers size={14} /> Document + Notes
                      </button>
                    </div>

                    {uploadStatusMsg && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                        <CheckCircle2 size={14} /> {uploadStatusMsg}
                      </span>
                    )}
                  </div>

                  {/* Multi-Content Document Upload / Card Section */}
                  {(contentInputMode === 'document' || contentInputMode === 'both' || attachedDoc) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                          <FileUp size={16} style={{ color: 'var(--accent-primary)' }} />
                          Concept Document (PDF, Slides PPT/PPTX, Word DOC/DOCX, Image)
                        </label>
                        {attachedDoc && (
                          <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> Active Concept Document
                          </span>
                        )}
                      </div>

                      {attachedDoc ? (
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 12,
                          padding: '0.9rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                            <div style={{
                              width: 44,
                              height: 44,
                              borderRadius: 10,
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {attachedDoc.type === 'pdf' ? <FileText size={22} /> :
                               attachedDoc.type === 'pptx' ? <Presentation size={22} /> :
                               attachedDoc.type === 'image' ? <ImageIcon size={22} /> :
                               <FileText size={22} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {attachedDoc.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.65rem', marginTop: 2, alignItems: 'center' }}>
                                <span style={{ textTransform: 'uppercase', background: 'rgba(99, 102, 241, 0.18)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                                  {attachedDoc.type}
                                </span>
                                {attachedDoc.size && (
                                  <span>{(attachedDoc.size / (1024 * 1024)).toFixed(2)} MB</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => docFileInputRef.current?.click()}
                              disabled={docUploading}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            >
                              {docUploading ? 'Uploading...' : 'Replace File'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttachedDoc(null)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                              title="Remove document"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => docFileInputRef.current?.click()}
                          style={{
                            border: '2px dashed rgba(255,255,255,0.14)',
                            borderRadius: 12,
                            padding: '1.75rem 1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.015)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={20} />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {docUploading ? 'Uploading concept document...' : 'Click or drop concept document here'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Supports PDF documents, PowerPoint slides (.ppt, .pptx), Word documents (.doc, .docx), and images
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Markdown Notes Area */}
                  {(contentInputMode === 'text' || contentInputMode === 'both' || !attachedDoc) && (
                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <label style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                          Content (Markdown supported) {attachedDoc ? '(Supplementary notes)' : '*'}
                        </label>
                        <button
                          type="button"
                          onClick={() => imgFileInputRef.current?.click()}
                          disabled={imageUploading}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <ImageIcon size={14} style={{ color: 'var(--accent-primary)' }} />
                          {imageUploading ? 'Uploading Image...' : 'Insert Image'}
                        </button>
                      </div>
                      <textarea
                        className="input-field textarea-field"
                        style={{
                          minHeight: attachedDoc ? 240 : 420,
                          maxHeight: '60vh',
                          resize: 'vertical',
                          fontFamily: 'monospace',
                          fontSize: '0.92rem',
                          lineHeight: '1.6'
                        }}
                        value={lessonForm.notes}
                        onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })}
                        required={!attachedDoc}
                        placeholder="Write the concept content for this topic here using Markdown, images, formulas, code..."
                      />
                    </div>
                  )}

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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                      <button type="submit" className="btn btn-primary" disabled={isLoading || docUploading || imageUploading}>
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
                style={{ width: '92vw', maxWidth: 1200, height: '90vh', background: '#07070a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Play size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Content Preview</h2>
                    {attachedDoc && (
                      <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>
                        {attachedDoc.name} ({attachedDoc.type.toUpperCase()})
                      </span>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={() => setPreviewMode(false)} style={{ padding: '8px 16px', borderRadius: '99px' }}>
                    <ArrowLeft size={16} /> Back to Editor
                  </button>
                </div>
                <div className={lessonStyles.notesBody} style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3.5rem' }}>
                  {attachedDoc && (
                    <div style={{ marginBottom: lessonForm.notes?.trim() ? '2.5rem' : 0 }}>
                      <DocumentViewer document={attachedDoc} />
                    </div>
                  )}
                  {lessonForm.notes?.trim() ? (
                    <ReactMarkdown>{lessonForm.notes}</ReactMarkdown>
                  ) : !attachedDoc ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                      <p>No content written or document attached yet.</p>
                      <button className="btn btn-secondary" onClick={() => setPreviewMode(false)} style={{ marginTop: '1rem' }}>Start Writing</button>
                    </div>
                  ) : null}
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

'use client';


import { useState, useRef, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Play,
  PlayCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  Layers,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Module, Lesson, Course } from '@/generated/prisma/client';
import { parseLessonContent, serializeLessonContent, getDocumentType, LessonDocument } from '@/lib/lessonContent';
import DocumentViewer from '@/components/common/DocumentViewer';
import { FileUp, Image as ImageIcon, Presentation, Upload, Trash } from 'lucide-react';
import LessonContentManager from '@/components/admin/LessonContentManager';
import { getCourseVisual, CourseThemeInfo } from '@/lib/courseImages';
import styles from './lessons.module.css';
import lessonStyles from '@/app/learn/[courseId]/lesson/[lessonId]/lesson.module.css';

type CourseWithData = Course & {
  modules: (Module & {
    lessons: Lesson[];
  })[];
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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Topic generation
  const [numTopics, setNumTopics] = useState<number | ''>(10);
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

  // Distinct categories available in current courses
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      const visual = getCourseVisual(c.category, c.title, c.logo);
      if (visual.tag) set.add(visual.tag);
    });
    return Array.from(set);
  }, [courses]);

  // Overall Statistics
  const totalCourses = courses.length;
  const totalTopics = useMemo(
    () => courses.reduce((acc, c) => acc + c.modules.length, 0),
    [courses]
  );
  const totalLessons = useMemo(
    () => courses.reduce((acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0), 0),
    [courses]
  );
  const activeSyllabusCount = useMemo(
    () => courses.filter((c) => c.modules.length > 0).length,
    [courses]
  );

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const visual = getCourseVisual(c.category, c.title, c.logo);
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        visual.tag.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || visual.tag === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, selectedCategory]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedCourseVisual = selectedCourse
    ? getCourseVisual(selectedCourse.category, selectedCourse.title, selectedCourse.logo)
    : null;

  const handleGenerateTopics = async (countOverride?: number) => {
    const count = countOverride || numTopics;
    if (!selectedCourseId || !count || count <= 0 || count > 20) {
      alert('Please enter a valid number of topics (1-20)');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/modules/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourseId, count: Number(count) }),
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
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const openAddLesson = (moduleId: string) => {
    setEditingLesson(null);
    setSelectedModuleId(moduleId);
    const moduleItem = selectedCourse?.modules.find((m) => m.id === moduleId);
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
      const moduleItem = selectedCourse?.modules.find((m) => m.id === selectedModuleId);
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
    } catch {
      alert('Error saving lesson');
    } finally {
      setIsLoading(false);
    }
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
    } catch {
      alert('Error saving module');
    } finally {
      setIsLoading(false);
    }
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
      <div className={styles.pageContainer}>
        {/* ================================================================= */}
        {/* VIEW 1: COURSE CURRICULUM SELECTION OVERVIEW                      */}
        {/* ================================================================= */}
        {!selectedCourseId && (
          <>
            {/* 1. Page Header */}
            <div className={styles.header}>
              <div className={styles.titleArea}>
                <div className={styles.titleRow}>
                  <h1 className={styles.pageTitle}>Curriculum & Lessons Studio</h1>
                  <span className={styles.headerBadge}>
                    <Sparkles size={12} /> Syllabus Studio
                  </span>
                </div>
                <p className={styles.pageSubtitle}>
                  Structure modular learning tracks, configure topic progressions, and author rich interactive video lessons.
                </p>
              </div>
            </div>

            {/* 2. Enterprise Metric Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={`${styles.statIconBox} ${styles.statIconBlue}`}>
                  <BookOpen size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalCourses}</div>
                  <div className={styles.statLabel}>Total Tracks</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIconBox} ${styles.statIconEmerald}`}>
                  <Layers size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalTopics}</div>
                  <div className={styles.statLabel}>Course Topics</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIconBox} ${styles.statIconPurple}`}>
                  <PlayCircle size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalLessons}</div>
                  <div className={styles.statLabel}>Active Lessons</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIconBox} ${styles.statIconAmber}`}>
                  <CheckCircle2 size={24} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {activeSyllabusCount} / {totalCourses}
                  </div>
                  <div className={styles.statLabel}>Syllabi Ready</div>
                </div>
              </div>
            </div>

            {/* 3. Search & Filter Bar */}
            <div className={styles.toolbarCard}>
              <div className={styles.toolbarTop}>
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search courses by title or curriculum track..."
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className={styles.clearSearchBtn}
                      onClick={() => setSearch('')}
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className={styles.filterCountBadge}>
                  Showing {filteredCourses.length} of {courses.length} courses
                </div>
              </div>

              {/* Category Pills */}
              <div className={styles.categoryPillsScroll}>
                <button
                  className={`${styles.categoryPill} ${
                    selectedCategory === 'ALL' ? styles.categoryPillActive : ''
                  }`}
                  onClick={() => setSelectedCategory('ALL')}
                >
                  All Tracks ({courses.length})
                </button>
                {availableCategories.map((cat: string) => {
                  const count = courses.filter((c: CourseWithData) => {
                    const v = getCourseVisual(c.category, c.title, c.logo);
                    return v.tag === cat;
                  }).length;
                  return (
                    <button
                      key={cat}
                      className={`${styles.categoryPill} ${
                        selectedCategory === cat ? styles.categoryPillActive : ''
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Course Cards Grid */}
            <div className={styles.coursesGrid}>
              {filteredCourses.map((course: CourseWithData) => {
                const visual = getCourseVisual(course.category, course.title, course.logo);
                const totalLessonsInCourse = course.modules.reduce(
                  (acc: number, m: any) => acc + m.lessons.length,
                  0
                );
                const hasModules = course.modules.length > 0;
                const densityPercent = Math.min(
                  100,
                  Math.round((totalLessonsInCourse / Math.max(1, course.modules.length * 3)) * 100)
                );

                return (
                  <div
                    key={course.id}
                    className={styles.courseCard}
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    {/* Visual Banner Header */}
                    <div
                      className={styles.cardBanner}
                      style={{ background: visual.gradient }}
                    >
                      {/* Ambient SVG illustration */}
                      {visual.imageSrc && (
                        <img
                          src={visual.imageSrc}
                          alt=""
                          className={styles.bannerIllustration}
                          aria-hidden="true"
                        />
                      )}

                      {/* Category Tag */}
                      <span className={styles.cardCategoryBadge}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: visual.accent,
                          }}
                        />
                        {visual.tag}
                      </span>

                      {/* Status Pill */}
                      <span
                        className={`${styles.cardStatusBadge} ${
                          course.isPublished ? styles.statusPublished : styles.statusDraft
                        }`}
                      >
                        <span
                          className={`${styles.statusDot} ${
                            course.isPublished
                              ? styles.statusDotPublished
                              : styles.statusDotDraft
                          }`}
                        />
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardTitleRow}>
                        <div className={styles.courseIconBox}>
                          {visual.icon}
                        </div>
                        <div>
                          <h3 className={styles.cardTitle}>{course.title}</h3>
                          <div className={styles.cardMetaRow}>
                            <span>{course.level || 'All Levels'}</span>
                            <span>&bull;</span>
                            <span>{course.duration || 'Comprehensive'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className={styles.cardMetricsGrid}>
                        <div className={styles.metricItem}>
                          <Layers size={18} className={styles.metricIcon} />
                          <div className={styles.metricDetails}>
                            <span className={styles.metricNumber}>
                              {course.modules.length}
                            </span>
                            <span className={styles.metricLabel}>Topics</span>
                          </div>
                        </div>
                        <div className={styles.metricItem}>
                          <PlayCircle size={18} className={styles.metricIcon} />
                          <div className={styles.metricDetails}>
                            <span className={styles.metricNumber}>
                              {totalLessonsInCourse}
                            </span>
                            <span className={styles.metricLabel}>Lessons</span>
                          </div>
                        </div>
                      </div>

                      {/* Curriculum Density Bar */}
                      <div className={styles.densityBarContainer}>
                        <div className={styles.densityTrack}>
                          <div
                            className={styles.densityFill}
                            style={{
                              width: `${hasModules ? Math.max(15, densityPercent) : 5}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardFooterText}>
                        {hasModules ? 'Curriculum Configured' : 'Needs Topic Setup'}
                      </span>
                      <span className={styles.manageCta}>
                        Manage Syllabus <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {filteredCourses.length === 0 && (
                <div className={styles.emptyGridState}>
                  <Search size={40} style={{ color: '#94a3b8', margin: '0 auto' }} />
                  <h3 className={styles.emptyStateTitle}>No courses found</h3>
                  <p className={styles.emptyStateText}>
                    No courses match your current search query or category filter. Try clearing filters or searching for another keyword.
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('ALL');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: COURSE DETAIL VIEW (TOPICS & LESSONS WORKSPACE)           */}
        {/* ================================================================= */}
        {selectedCourseId && selectedCourse && selectedCourseVisual && (
          <div style={{ animation: 'motionFadeIn 0.3s ease-out' }}>
            {/* Header Banner */}
            <div className={styles.detailHeaderCard}>
              <div
                className={styles.detailBanner}
                style={{ background: selectedCourseVisual.gradient }}
              >
                {selectedCourseVisual.imageSrc && (
                  <img
                    src={selectedCourseVisual.imageSrc}
                    alt=""
                    className={styles.bannerIllustration}
                    style={{ width: 220, height: 180, opacity: 0.35 }}
                    aria-hidden="true"
                  />
                )}

                <div className={styles.detailBannerContent}>
                  <button
                    onClick={() => setSelectedCourseId(null)}
                    className={styles.backBtn}
                  >
                    <ArrowLeft size={16} /> Back to Courses
                  </button>
                  <h1 className={styles.detailCourseTitle}>
                    {selectedCourse.title}
                  </h1>
                  <div className={styles.detailStatsRow}>
                    <span className={styles.detailStatPill}>
                      <Layers size={14} /> {selectedCourse.modules.length} Topics
                    </span>
                    <span className={styles.detailStatPill}>
                      <PlayCircle size={14} />{' '}
                      {selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                    </span>
                    <span className={styles.detailStatPill}>
                      <Clock size={14} /> {selectedCourse.duration || 'Flexible Pace'}
                    </span>
                    <span className={styles.detailStatPill}>
                      {selectedCourseVisual.tag}
                    </span>
                  </div>
                </div>

                <div className={styles.detailHeaderActions}>
                  <button
                    className={styles.primaryWhiteBtn}
                    onClick={() => {
                      setEditingModule(null);
                      setModuleForm({
                        title: '',
                        description: '',
                        order: selectedCourse.modules.length,
                      });
                      setShowModuleModal(true);
                    }}
                  >
                    <Plus size={18} /> Add Topic Manually
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Generate Topics Wizard (Empty state) */}
            {selectedCourse.modules.length === 0 && (
              <div className={styles.generatorCard}>
                <div className={styles.generatorIconCircle}>
                  <Layers size={32} />
                </div>
                <h3 className={styles.generatorTitle}>
                  Generate Course Curriculum Architecture
                </h3>
                <p className={styles.generatorDescription}>
                  This course currently has no structured topics. Kickstart your syllabus by auto-generating topic modules, then customize titles and attach video lessons.
                </p>

                {/* Preset Pills */}
                <div className={styles.presetPillsRow}>
                  {[5, 10, 15, 20].map((preset) => (
                    <button
                      key={preset}
                      className={`${styles.presetBtn} ${
                        numTopics === preset ? styles.presetBtnActive : ''
                      }`}
                      onClick={() => setNumTopics(preset)}
                    >
                      {preset} Topics
                    </button>
                  ))}
                </div>

                <div className={styles.generatorInputRow}>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g. 10"
                    className={styles.generatorInput}
                    value={numTopics}
                    onChange={(e) =>
                      setNumTopics(e.target.value === '' ? '' : parseInt(e.target.value))
                    }
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGenerateTopics()}
                    disabled={isGenerating || !numTopics}
                    style={{ height: 44, padding: '0 24px', fontWeight: 700 }}
                  >
                    {isGenerating ? 'Generating Topics...' : 'Generate Syllabus Topics'}
                  </button>
                </div>
              </div>
            )}

            {/* Topics & Lessons Accordion List */}
            {selectedCourse.modules.length > 0 && (
              <div className={styles.topicsContainer}>
                {selectedCourse.modules.map((mod, index) => (
                  <div key={mod.id} className={styles.topicCard}>
                    <div
                      className={styles.topicHeader}
                      onClick={() => toggleModule(mod.id)}
                    >
                      <div className={styles.topicLeft}>
                        {expanded.has(mod.id) ? (
                          <ChevronDown size={18} style={{ color: '#2563eb' }} />
                        ) : (
                          <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                        )}
                        <span className={styles.topicIndexPill}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className={styles.topicTitleArea}>
                          <span className={styles.topicTitle}>{mod.title}</span>
                          {mod.description && (
                            <span className={styles.topicDescription}>
                              {mod.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.topicRight}>
                        <span className={styles.topicLessonCount}>
                          {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>

                        <button
                          className={styles.iconActionBtn}
                          title="Edit Topic"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModule(mod);
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          className={`${styles.iconActionBtn} ${styles.iconActionDanger}`}
                          title="Delete Topic"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(mod.id);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>

                        {mod.lessons.length > 0 ? (
                          <button
                            className={styles.primaryAddLessonBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditLesson(mod.lessons[0], mod.id);
                            }}
                          >
                            <Edit3 size={14} /> Edit Lesson
                          </button>
                        ) : (
                          <button
                            className={styles.primaryAddLessonBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddLesson(mod.id);
                            }}
                          >
                            <Plus size={14} /> Add Lesson
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Lessons */}
                    {expanded.has(mod.id) && (
                      <div className={styles.lessonsContainer}>
                        {mod.lessons.length === 0 && (
                          <div className={styles.emptyLessonsNotice}>
                            No lessons attached to this topic yet. Click "Add Lesson" to compose content.
                          </div>
                        )}
                        {mod.lessons.map((lesson) => (
                          <div key={lesson.id} className={styles.lessonRow}>
                            <div className={styles.lessonRowLeft}>
                              <div className={styles.lessonPlayIcon}>
                                <Play size={13} />
                              </div>
                              <span className={styles.lessonTitleText}>
                                {lesson.title}
                              </span>
                              <div className={styles.lessonBadgesRow}>
                                {lesson.duration && (
                                  <span className={styles.badgeDuration}>
                                    <Clock size={11} /> {lesson.duration}
                                  </span>
                                )}
                                {lesson.isFree && (
                                  <span className={styles.badgeFree}>Free Preview</span>
                                )}
                                {lesson.videoUrl && (
                                  <span className={styles.badgeVideo}>
                                    <Video size={11} /> Video
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.lessonRowActions}>
                              <button
                                className={styles.iconActionBtn}
                                title="Edit Lesson Content"
                                onClick={() => openEditLesson(lesson, mod.id)}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                className={styles.iconActionBtn}
                                title="Manage File Attachments"
                                onClick={() =>
                                  setFilesLessonId(
                                    filesLessonId === lesson.id ? null : lesson.id
                                  )
                                }
                              >
                                <Paperclip size={15} />
                              </button>
                              <button
                                className={`${styles.iconActionBtn} ${styles.iconActionDanger}`}
                                title="Delete Lesson"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Inline Lesson Content & Attachments Manager */}
                            {filesLessonId === lesson.id && (
                              <div
                                style={{
                                  padding: '1rem 1.5rem',
                                  borderTop: '1px solid #e2e8f0',
                                  width: '100%',
                                  background: '#ffffff',
                                }}
                              >
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

        {/* ================================================================= */}
        {/* MODAL 1: LESSON CONTENT MODAL                                     */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showLessonModal && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isLoading && setShowLessonModal(false)}
            >
              <motion.div

                className="modal-content"
                style={{ width: '92vw', maxWidth: 1400, maxHeight: '92vh', overflowY: 'auto', background: '#0b0b12', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}

                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Video URL (Optional)</label>
                        <input
                          type="url"
                          className="input-field"
                          placeholder="https://vimeo.com/... or https://youtube.com/..."
                          value={lessonForm.videoUrl || ''}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Duration (e.g. 15 mins)</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. 20 mins"
                          value={lessonForm.duration || ''}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, duration: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div className={styles.formGroup} style={{ width: 120 }}>
                        <label className={styles.formLabel}>Order Index</label>
                        <input
                          type="number"
                          className="input-field"
                          value={lessonForm.order}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              order: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
                        <input
                          type="checkbox"
                          id="isFree"
                          checked={lessonForm.isFree}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, isFree: e.target.checked })
                          }
                          style={{ width: 18, height: 18, accentColor: '#2563eb' }}
                        />
                        <label
                          htmlFor="isFree"
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          Enable Free Preview for Unenrolled Students
                        </label>
                      </div>
                    </div>
                  </div>


                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 

                      onClick={() => setPreviewMode(true)}
                    >
                      <Play size={15} /> Preview Markdown
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowLessonModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Saving...'
                        : editingLesson
                        ? 'Update Lesson'
                        : 'Create Lesson'}
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
            </div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MODAL 2: MARKDOWN PREVIEW MODAL                                   */}
        {/* ================================================================= */}
        <AnimatePresence>
          {previewMode && (
            <div className={styles.modalBackdrop} style={{ zIndex: 1200 }}>
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
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPreviewMode(false)}
                  >
                    <ArrowLeft size={15} /> Back to Editor
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
            </div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MODAL 3: TOPIC MODAL                                              */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showModuleModal && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isLoading && setShowModuleModal(false)}
            >
              <motion.div
                className={styles.modalContent}
                style={{ maxWidth: 520 }}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>
                    {editingModule ? 'Edit Topic' : 'Add New Topic'}
                  </h2>
                  <button
                    className={styles.iconActionBtn}
                    onClick={() => setShowModuleModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleModuleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Topic Title *</label>
                      <input
                        className="input-field"
                        value={moduleForm.title}
                        onChange={(e) =>
                          setModuleForm({ ...moduleForm, title: e.target.value })
                        }
                        required
                        placeholder="e.g. Asynchronous Programming & Promises"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Description (Optional)</label>
                      <input
                        className="input-field"
                        value={moduleForm.description}
                        onChange={(e) =>
                          setModuleForm({ ...moduleForm, description: e.target.value })
                        }
                        placeholder="Brief summary of learning objectives in this topic"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Order Index</label>
                      <input
                        type="number"
                        className="input-field"
                        value={moduleForm.order}
                        onChange={(e) =>
                          setModuleForm({
                            ...moduleForm,
                            order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModuleModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Saving...'
                        : editingModule
                        ? 'Update Topic'
                        : 'Add Topic'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

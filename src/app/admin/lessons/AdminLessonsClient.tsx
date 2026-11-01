'use client';

import React, { useState, useMemo } from 'react';
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
      const moduleItem = selectedCourse?.modules.find((m) => m.id === selectedModuleId);
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
                {availableCategories.map((cat) => {
                  const count = courses.filter((c) => {
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
              {filteredCourses.map((course) => {
                const visual = getCourseVisual(course.category, course.title, course.logo);
                const totalLessonsInCourse = course.modules.reduce(
                  (acc, m) => acc + m.lessons.length,
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
                className={styles.modalContent}
                style={{ maxWidth: 860 }}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>
                    {editingLesson ? 'Edit Lesson Content' : 'Add Lesson Content'}
                  </h2>
                  <button
                    className={styles.iconActionBtn}
                    onClick={() => setShowLessonModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleLessonSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Lesson Content (Markdown Supported) *
                      </label>
                      <textarea
                        className="input-field textarea-field"
                        style={{
                          minHeight: 280,
                          maxHeight: '50vh',
                          fontFamily: 'monospace',
                          fontSize: '0.92rem',
                          lineHeight: '1.6',
                        }}
                        value={lessonForm.notes}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, notes: e.target.value })
                        }
                        required
                        placeholder="Write or paste your comprehensive curriculum lesson notes in Markdown..."
                      />
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

                  <div className={styles.modalFooter}>
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
                className={styles.modalContent}
                style={{ maxWidth: 900, height: '85vh' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              >
                <div className={styles.modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} style={{ color: '#2563eb' }} />
                    <h2 className={styles.modalTitle}>Markdown Notes Preview</h2>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPreviewMode(false)}
                  >
                    <ArrowLeft size={15} /> Back to Editor
                  </button>
                </div>
                <div
                  className={lessonStyles.notesBody}
                  style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', background: '#ffffff' }}
                >
                  {lessonForm.notes ? (
                    <ReactMarkdown>{lessonForm.notes}</ReactMarkdown>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                      <p>No content written yet.</p>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewMode(false)}
                        style={{ marginTop: 12 }}
                      >
                        Start Writing
                      </button>
                    </div>
                  )}
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

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
  Star,
  Clock,
  BookOpen,
  Users,
  GraduationCap,
  LayoutGrid,
  List,
  UserPlus,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createCourse, updateCourse, deleteCourse } from '@/lib/actions';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer, Student, Enrollment } from '@/generated/prisma/client';
import { getCourseVisual } from '@/lib/courseImages';
import styles from './page.module.css';

interface AdminCoursesClientProps {
  initialCourses: CourseWithArrays[];
  trainers: Trainer[];
  students: Student[];
  initialEnrollments?: Enrollment[];
}

const emptyForm = {
  title: '',
  description: '',
  shortDescription: '',
  logo: '📘',
  price: 0,
  discountPrice: undefined as number | undefined,
  trainerId: '',
  category: 'Web Development',
  level: 'Beginner',
  duration: '40 Hours',
  lessonsCount: 10,
  tags: [] as string[],
  syllabus: [] as string[],
  isPublished: true,
};

export default function AdminCoursesClient({
  initialCourses,
  trainers,
  students,
  initialEnrollments = [],
}: AdminCoursesClientProps) {
  // Course data state
  const [courses, setCourses] = useState<CourseWithArrays[]>(initialCourses);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'ALPHABETICAL' | 'RATING' | 'ENROLLMENTS'>('RECENT');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithArrays | null>(null);
  const [courseForm, setCourseForm] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Assignment Modal state
  const [assignModalCourse, setAssignModalCourse] = useState<CourseWithArrays | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignSearch, setAssignSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignAlert, setAssignAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Distinct categories available in current courses
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      const visual = getCourseVisual(c.category, c.title, c.logo);
      if (visual.tag) set.add(visual.tag);
    });
    return Array.from(set);
  }, [courses]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.isPublished).length;
    const drafts = total - published;
    const totalEnrolled = enrollments.length;
    return { total, published, drafts, totalEnrolled };
  }, [courses, enrollments]);

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const visual = getCourseVisual(course.category, course.title, course.logo);
        // Status filter
        if (statusFilter === 'PUBLISHED' && !course.isPublished) return false;
        if (statusFilter === 'DRAFT' && course.isPublished) return false;

        // Category filter
        if (categoryFilter !== 'ALL' && visual.tag !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const trainer = trainers.find((t) => t.id === course.trainerId);
          const matchTitle = course.title?.toLowerCase().includes(q);
          const matchCat = course.category?.toLowerCase().includes(q) || visual.tag.toLowerCase().includes(q);
          const matchTrainer = trainer?.name?.toLowerCase().includes(q);
          const matchDesc = course.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchTrainer && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ALPHABETICAL') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'RATING') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'ENROLLMENTS') {
          const countA = enrollments.filter((e) => e.courseId === a.id).length;
          const countB = enrollments.filter((e) => e.courseId === b.id).length;
          return countB - countA;
        }
        // Default RECENT (createdAt descending)
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [courses, searchQuery, statusFilter, categoryFilter, sortBy, trainers, enrollments]);

  // Helpers
  const getEnrollmentCount = (courseId: string) => {
    return enrollments.filter((e) => e.courseId === courseId).length;
  };

  // Toggle publish/draft
  const togglePublish = async (course: CourseWithArrays) => {
    const updatedStatus = !course.isPublished;
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, isPublished: updatedStatus } : c))
    );

    try {
      await updateCourse(course.id, { isPublished: updatedStatus });
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      // Revert on error
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: course.isPublished } : c))
      );
    }
  };

  // Open Create Modal
  const openAddModal = () => {
    setEditingCourse(null);
    setCourseForm(emptyForm);
    setTagsInput('');
    setSyllabusInput('');
    setShowCourseModal(true);
  };

  // Open Edit Modal
  const openEditModal = (course: CourseWithArrays) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      logo: course.logo || '📘',
      price: course.price,
      discountPrice: course.discountPrice || undefined,
      trainerId: course.trainerId || '',
      category: course.category || 'Web Development',
      level: course.level || 'Beginner',
      duration: course.duration || '40 Hours',
      lessonsCount: course.lessonsCount || 10,
      tags: course.tags || [],
      syllabus: course.syllabus || [],
      isPublished: course.isPublished,
    });
    setTagsInput((course.tags || []).join(', '));
    setSyllabusInput((course.syllabus || []).join('\n'));
    setShowCourseModal(true);
  };

  // Save course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const syllabus = syllabusInput.split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { ...courseForm, tags, syllabus });
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? ({
                  ...c,
                  ...courseForm,
                  discountPrice: courseForm.discountPrice ?? null,
                  tags,
                  syllabus,
                } as CourseWithArrays)
              : c
          )
        );
      } else {
        const created = await createCourse({ ...courseForm, tags, syllabus });
        if (created) {
          setCourses((prev) => [created as any, ...prev]);
        }
      }
      setShowCourseModal(false);
    } catch (err) {
      console.error(err);
      alert('Error saving course. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Assign Modal
  const openAssignModal = (course: CourseWithArrays) => {
    setAssignModalCourse(course);
    setSelectedStudentIds([]);
    setAssignSearch('');
    setAssignAlert(null);
  };

  // Handle student assignment submit
  const handleAssignSubmit = async () => {
    if (!assignModalCourse || selectedStudentIds.length === 0) return;
    setIsAssigning(true);
    setAssignAlert(null);

    try {
      const res = await fetch('/api/admin/enrollments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: assignModalCourse.id,
          studentIds: selectedStudentIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign course');
      }

      setAssignAlert({
        type: 'success',
        message: `Successfully assigned ${selectedStudentIds.length} student(s) to ${assignModalCourse.title}. Email notifications dispatched.`,
      });

      if (data.newEnrollments && Array.isArray(data.newEnrollments)) {
        setEnrollments((prev) => [...prev, ...data.newEnrollments]);
      }

      setTimeout(() => {
        setAssignModalCourse(null);
        setSelectedStudentIds([]);
      }, 1600);
    } catch (err: any) {
      setAssignAlert({
        type: 'error',
        message: err.message || 'Error occurred while assigning course.',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter students in assignment modal
  const modalFilteredStudents = useMemo(() => {
    if (!assignSearch.trim()) return students;
    const q = assignSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, assignSearch]);

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  return (
    <PageTransition>
      <div className={styles.pageContainer}>
        {/* ──────────────────────────────────────────────────────────────────
            1. PAGE HEADER
            ────────────────────────────────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Courses Management</h1>
              <span className={styles.headerBadge}>
                <Sparkles size={12} /> Academy Catalog
              </span>
            </div>
            <p className={styles.pageSubtitle}>
              Create, organize, monitor, and publish curriculum tracks across ATLYX Academy.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.primaryBtn} onClick={openAddModal}>
              <Plus size={18} strokeWidth={2.5} />
              <span>Create New Course</span>
            </button>
          </div>
        </header>

        {/* ──────────────────────────────────────────────────────────────────
            2. STATISTICS DASHBOARD METRIC CARDS
            ────────────────────────────────────────────────────────────────── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconBlue}`}>
              <BookOpen size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Courses</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconGreen}`}>
              <CheckCircle2 size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.published}</span>
              <span className={styles.statLabel}>Published Courses</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconAmber}`}>
              <Clock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.drafts}</span>
              <span className={styles.statLabel}>Draft Courses</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconIndigo}`}>
              <GraduationCap size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalEnrolled}</span>
              <span className={styles.statLabel}>Total Enrollments</span>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            3. TOOLBAR: SEARCH, CATEGORY PILLS & CONTROLS
            ────────────────────────────────────────────────────────────────── */}
        <div className={styles.toolbarCard}>
          <div className={styles.toolbarTop}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search courses by title, category, or instructor..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              className={styles.selectInput}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status ({courses.length})</option>
              <option value="PUBLISHED">Published ({stats.published})</option>
              <option value="DRAFT">Draft ({stats.drafts})</option>
            </select>

            {/* Sorting */}
            <select
              className={styles.selectInput}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="RECENT">Recently Created</option>
              <option value="ALPHABETICAL">Alphabetical (A-Z)</option>
              <option value="RATING">Highest Rated</option>
              <option value="ENROLLMENTS">Most Enrolled</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>

            <div className={styles.filterCountBadge}>
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className={styles.categoryPillsScroll}>
            <button
              className={`${styles.categoryPill} ${
                categoryFilter === 'ALL' ? styles.categoryPillActive : ''
              }`}
              onClick={() => setCategoryFilter('ALL')}
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
                    categoryFilter === cat ? styles.categoryPillActive : ''
                  }`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            4. COURSE CARDS GRID OR TABLE VIEW
            ────────────────────────────────────────────────────────────────── */}
        {filteredCourses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconBox}>
              <BookOpen size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No courses found</h3>
            <p className={styles.emptyDesc}>
              {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'No courses matched your current filter criteria. Try adjusting your search query or reset the filters.'
                : 'Get started by creating your first course in ATLYX Academy.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                >
                  Reset Filters
                </button>
              )}
              <button className={styles.primaryBtn} onClick={openAddModal}>
                <Plus size={16} /> Create Course
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.coursesGrid}>
            {filteredCourses.map((course) => {
              const trainer = trainers.find((t) => t.id === course.trainerId);
              const visual = getCourseVisual(course.category, course.title, course.logo);
              const enrollCount = getEnrollmentCount(course.id);

              return (
                <div key={course.id} className={styles.courseCard}>
                  {/* Hero Gradient Banner */}
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

                    {/* Category Badge */}
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

                    {/* Status Badge */}
                    <span
                      className={`${styles.statusBadge} ${
                        course.isPublished ? styles.statusPublished : styles.statusDraft
                      }`}
                    >
                      <span className={styles.statusDot} />
                      <span>{course.isPublished ? 'Published' : 'Draft'}</span>
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <div className={styles.courseIconBox}>
                        {visual.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className={styles.courseTitle} title={course.title}>
                          {course.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span className={styles.levelBadge}>{course.level || 'Beginner'}</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>&bull; {course.duration || 'Self-paced'}</span>
                        </div>
                      </div>
                    </div>

                    <p className={styles.courseDesc}>
                      {course.shortDescription || course.description || 'Comprehensive learning curriculum designed for mastery.'}
                    </p>

                    {/* Metadata Chips */}
                    <div className={styles.metadataRow}>
                      <div className={`${styles.metaItem} ${styles.metaRating}`}>
                        <Star size={13} fill="#d97706" stroke="#d97706" />
                        <span>{course.rating || '4.8'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={13} className={styles.metaIcon} />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BookOpen size={13} className={styles.metaIcon} />
                        <span>{course.lessonsCount || 0} Lessons</span>
                      </div>
                      <div className={styles.metaItem} title="Enrolled Students">
                        <Users size={13} className={styles.metaIcon} />
                        <span>{enrollCount} Enrolled</span>
                      </div>
                    </div>

                    {/* Instructor & Pricing Row */}
                    <div className={styles.instructorPricingRow}>
                      <div className={styles.instructorInfo}>
                        <div className={styles.instructorAvatar}>
                          {trainer?.name ? trainer.name.charAt(0) : 'A'}
                        </div>
                        <div className={styles.instructorText}>
                          <span className={styles.instructorName}>
                            {trainer?.name || 'Academic Faculty'}
                          </span>
                          <span className={styles.instructorRole}>Lead Trainer</span>
                        </div>
                      </div>

                      <div className={styles.pricingBlock}>
                        {course.discountPrice && (
                          <span className={styles.originalPrice}>₹{course.price}</span>
                        )}
                        <span className={styles.currentPrice}>
                          ₹{course.discountPrice ?? course.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className={styles.footerArea}>
                    <Link
                      href={`/courses/${course.id}`}
                      target="_blank"
                      className={styles.viewCourseLink}
                      title="View public course details"
                    >
                      <span>Explore</span>
                      <ExternalLink size={13} />
                    </Link>

                    <div className={styles.cardActionButtons}>
                      {/* Assign to Students */}
                      <button
                        type="button"
                        className={`${styles.cardActionBtn} ${styles.btnAssign}`}
                        onClick={() => openAssignModal(course)}
                        title="Assign to registered students"
                      >
                        <UserPlus size={15} />
                      </button>

                      {/* Toggle Publish / Draft */}
                      <button
                        type="button"
                        className={`${styles.cardActionBtn} ${course.isPublished ? styles.btnPublishOn : styles.btnPublishOff}`}
                        onClick={() => togglePublish(course)}
                        title={course.isPublished ? 'Unpublish course' : 'Publish course'}
                      >
                        {course.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>

                      {/* Edit Course */}
                      <button
                        type="button"
                        className={`${styles.cardActionBtn} ${styles.btnEdit}`}
                        onClick={() => openEditModal(course)}
                        title="Edit course configuration"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Course */}
                      <button
                        type="button"
                        className={`${styles.cardActionBtn} ${styles.btnDanger}`}
                        onClick={() => setDeleteConfirmId(course.id)}
                        title="Delete course"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className={styles.tableCard}>
            <table className={styles.coursesTable}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Trainer</th>
                  <th>Level</th>
                  <th>Enrollments</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => {
                  const trainer = trainers.find((t) => t.id === course.trainerId);
                  const visual = getCourseVisual(course.category, course.title, course.logo);
                  const enrollCount = getEnrollmentCount(course.id);

                  return (
                    <tr key={course.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.tableCourseCell}>
                          <div
                            className={styles.tableThumb}
                            style={{ background: visual.gradient }}
                          >
                            {visual.icon}
                          </div>
                          <div>
                            <Link
                              href={`/courses/${course.id}`}
                              target="_blank"
                              className={styles.tableCourseTitle}
                            >
                              {course.title}
                            </Link>
                            <span className={styles.tableCategory}>
                              {course.duration || 'Self-paced'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                          {course.category}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            course.isPublished ? styles.statusPublished : styles.statusDraft
                          }`}
                        >
                          <span className={styles.statusDot} />
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                          {trainer?.name || 'Academic Faculty'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                          {course.level || 'Beginner'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                          {enrollCount} Students
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                          ₹{course.discountPrice ?? course.price}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className={`${styles.cardActionBtn} ${styles.btnAssign}`}
                            onClick={() => openAssignModal(course)}
                            title="Assign to students"
                          >
                            <UserPlus size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.cardActionBtn} ${course.isPublished ? styles.btnPublishOn : styles.btnPublishOff}`}
                            onClick={() => togglePublish(course)}
                            title={course.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            className={`${styles.cardActionBtn} ${styles.btnEdit}`}
                            onClick={() => openEditModal(course)}
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.cardActionBtn} ${styles.btnDanger}`}
                            onClick={() => setDeleteConfirmId(course.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            5. STUDENT ASSIGNMENT MODAL
            ────────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {assignModalCourse && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isAssigning && setAssignModalCourse(null)}
            >
              <motion.div
                className={styles.modalBox}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div>
                    <h3 className={styles.modalTitle}>Assign Course Access</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Course: <strong>{assignModalCourse.title}</strong>
                    </p>
                  </div>
                  <button
                    className={styles.modalCloseBtn}
                    onClick={() => !isAssigning && setAssignModalCourse(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {assignAlert && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        marginBottom: '14px',
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor:
                          assignAlert.type === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: assignAlert.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${
                          assignAlert.type === 'success' ? '#bbf7d0' : '#fecaca'
                        }`,
                      }}
                    >
                      {assignAlert.type === 'success' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>{assignAlert.message}</span>
                    </div>
                  )}

                  <div className={styles.searchWrapper} style={{ maxWidth: '100%', marginBottom: '10px' }}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      className={styles.searchInput}
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      padding: '4px 2px',
                    }}
                  >
                    <span>
                      Selected:{' '}
                      <strong style={{ color: '#0f172a' }}>{selectedStudentIds.length}</strong>{' '}
                      student(s)
                    </span>
                    {modalFilteredStudents.length > 0 && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const allIds = modalFilteredStudents.map((s) => s.id);
                          const allSelected = allIds.every((id) => selectedStudentIds.includes(id));
                          if (allSelected) {
                            setSelectedStudentIds((prev) =>
                              prev.filter((id) => !allIds.includes(id))
                            );
                          } else {
                            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...allIds])));
                          }
                        }}
                      >
                        Select All Filtered
                      </button>
                    )}
                  </div>

                  <div className={styles.studentAssignList}>
                    {modalFilteredStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const isAlreadyEnrolled = enrollments.some(
                        (e) => e.courseId === assignModalCourse.id && e.studentId === student.id
                      );

                      return (
                        <div
                          key={student.id}
                          className={`${styles.studentAssignItem} ${
                            isSelected ? styles.studentSelected : ''
                          }`}
                          onClick={() => toggleStudentSelection(student.id)}
                        >
                          <div className={styles.studentMetaLeft}>
                            <div className={styles.studentAssignAvatar}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className={styles.studentAssignName}>{student.name}</div>
                              <div className={styles.studentAssignEmail}>{student.email}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAlreadyEnrolled && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#e2e8f0',
                                  color: '#475569',
                                  fontWeight: 600,
                                }}
                              >
                                Enrolled
                              </span>
                            )}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {modalFilteredStudents.length === 0 && (
                      <p style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.86rem' }}>
                        No registered students found.
                      </p>
                    )}
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '12px', lineHeight: 1.4 }}>
                    💡 Assigned students will instantly see this course in their student dashboard and will receive an automated email notification with direct login deep links.
                  </p>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => setAssignModalCourse(null)}
                    disabled={isAssigning}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.primaryBtn}
                    onClick={handleAssignSubmit}
                    disabled={isAssigning || selectedStudentIds.length === 0}
                  >
                    {isAssigning
                      ? 'Assigning & Emailing...'
                      : `Assign & Notify (${selectedStudentIds.length})`}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ──────────────────────────────────────────────────────────────────
            6. CREATE / EDIT COURSE MODAL
            ────────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showCourseModal && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isSubmitting && setShowCourseModal(false)}
            >
              <motion.div
                className={`${styles.modalBox} ${styles.modalWide}`}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>
                    {editingCourse ? 'Edit Course Details' : 'Create New Learning Course'}
                  </h3>
                  <button
                    className={styles.modalCloseBtn}
                    onClick={() => !isSubmitting && setShowCourseModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveCourse}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Course Title *</label>
                      <input
                        type="text"
                        required
                        className={styles.formInput}
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g. Master Artificial Intelligence & Machine Learning"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Category *</label>
                        <select
                          className={styles.formInput}
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                          disabled={isSubmitting}
                        >
                          <option value="Artificial Intelligence">Artificial Intelligence</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Database Engineering">Database Engineering</option>
                          <option value="Programming Languages">Programming Languages</option>
                          <option value="Web Development">Web Development</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Difficulty Level *</label>
                        <select
                          className={styles.formInput}
                          value={courseForm.level}
                          onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                          disabled={isSubmitting}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Price (₹) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          className={styles.formInput}
                          value={courseForm.price}
                          onChange={(e) =>
                            setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })
                          }
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Discounted Price (₹)</label>
                        <input
                          type="number"
                          min={0}
                          className={styles.formInput}
                          value={courseForm.discountPrice || ''}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              discountPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="Optional discount price"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Duration *</label>
                        <input
                          type="text"
                          required
                          className={styles.formInput}
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                          placeholder="e.g. 48 Hours"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Assigned Trainer</label>
                        <select
                          className={styles.formInput}
                          value={courseForm.trainerId}
                          onChange={(e) => setCourseForm({ ...courseForm, trainerId: e.target.value })}
                          disabled={isSubmitting}
                        >
                          <option value="">Select Trainer (Optional)</option>
                          {trainers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.specialization || 'Instructor'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Short Description</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={courseForm.shortDescription}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, shortDescription: e.target.value })
                        }
                        placeholder="Brief summary for card display..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Comprehensive Description</label>
                      <textarea
                        className={styles.formTextarea}
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        placeholder="Full course overview, objectives, and curriculum breakdown..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tags (comma separated)</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g. AI, Machine Learning, Python, PyTorch"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Syllabus Modules (one per line)</label>
                      <textarea
                        className={styles.formTextarea}
                        value={syllabusInput}
                        onChange={(e) => setSyllabusInput(e.target.value)}
                        placeholder="Module 1: Foundations\nModule 2: Neural Networks\nModule 3: Transformers"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Publish Toggle */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <input
                        type="checkbox"
                        id="publishToggle"
                        checked={courseForm.isPublished}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, isPublished: e.target.checked })
                        }
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="publishToggle" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                        Publish Course immediately (Visible in Public Course Discovery)
                      </label>
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setShowCourseModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                      {isSubmitting
                        ? 'Saving...'
                        : editingCourse
                        ? 'Update Course'
                        : 'Create Course'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ──────────────────────────────────────────────────────────────────
            7. DELETE CONFIRMATION DIALOG
            ────────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isSubmitting && setDeleteConfirmId(null)}
            >
              <motion.div
                className={styles.modalBox}
                style={{ maxWidth: '440px', textAlign: 'center' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '32px 24px 20px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Trash2 size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                    Delete Course?
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Are you sure you want to permanently delete this course? This action cannot be undone and will remove all associated modules, lessons, notes, and quizzes.
                  </p>
                </div>

                <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => handleDeleteCourse(deleteConfirmId)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Deleting...' : 'Yes, Delete Course'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

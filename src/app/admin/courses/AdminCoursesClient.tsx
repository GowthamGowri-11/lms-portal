'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X,
  Eye, EyeOff, Star, Clock, BookOpen, ArrowRight,
} from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createCourse, updateCourse, deleteCourse } from '@/lib/actions';
import styles from './page.module.css';
import courseStyles from '../../courses/page.module.css';
import TechIllustration from '@/components/ui/TechIllustration';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer } from '@/generated/prisma/client';

function getAccentColor(title: string, category: string) {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('python')) return '#3b82f6';
  if (t.includes('java') && !t.includes('javascript')) return '#22c55e';
  if (t.includes('react')) return '#f97316';
  if (t.includes('node') || t.includes('express')) return '#a855f7';
  if (t.includes('angular')) return '#ef4444';
  if (t.includes('vue')) return '#10b981';
  if (t.includes('frontend') || t.includes('html')) return '#f97316';
  if (t.includes('data')) return '#06b6d4';
  if (t.includes('cloud') || t.includes('devops')) return '#f59e0b';
  return '#6366f1';
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
  duration: '',
  lessonsCount: 0,
  tags: [] as string[],
  syllabus: [] as string[],
  isPublished: true,
};

export default function AdminCoursesClient({
  initialCourses,
  trainers,
}: {
  initialCourses: CourseWithArrays[];
  trainers: Trainer[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithArrays | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagsInput, setTagsInput] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCourses = initialCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openAddModal = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setTagsInput('');
    setSyllabusInput('');
    setShowModal(true);
  };

  const openEditModal = (course: CourseWithArrays) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription,
      logo: course.logo,
      price: course.price,
      discountPrice: course.discountPrice || undefined,
      trainerId: course.trainerId,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessonsCount: course.lessonsCount,
      tags: course.tags,
      syllabus: course.syllabus,
      isPublished: course.isPublished,
    });
    setTagsInput(course.tags.join(', '));
    setSyllabusInput(course.syllabus.join('\n'));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const syllabus = syllabusInput.split('\n').map((s) => s.trim()).filter(Boolean);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { ...form, tags, syllabus });
      } else {
        await createCourse({ ...form, tags, syllabus });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Error saving course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteCourse(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Error deleting course');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (course: CourseWithArrays) => {
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Header */}
        <FadeInUp>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Courses</h1>
              <p className={styles.subtitle}>Manage all courses — add, edit, remove, and assign trainers.</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Course
            </button>
          </div>
        </FadeInUp>

        {/* Search */}
        <FadeInUp delay={0.1}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search courses by title or category..."
              className={`input-field ${styles.searchInput}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </FadeInUp>

        {/* Course Cards Grid */}
        <StaggerContainer className={styles.coursesGrid}>
          {filteredCourses.map((course) => {
            const trainer = trainers.find((t) => t.id === course.trainerId);
            const accent = getAccentColor(course.title, course.category);

            return (
              <StaggerItem key={course.id}>
                <motion.div
                  className={courseStyles.courseCard}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* ── ADMIN ACTION STRIP ── */}
                  <div className={styles.cardActionsOverlay}>
                    <span
                      className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => togglePublish(course)}
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {course.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button className={styles.actionBtn} onClick={() => openEditModal(course)} title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDanger}`}
                        onClick={() => setDeleteConfirm(course.id)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* ── CARD BODY (same as user side) ── */}
                  <div className={courseStyles.cardInner}>
                    {/* LEFT TEXT */}
                    <div className={courseStyles.cardLeft}>
                      <div className={courseStyles.cardTopRow}>
                        <span className={courseStyles.cardCategory}>{course.category}</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: accent, textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {course.level}
                        </span>
                      </div>

                      <h3 className={courseStyles.cardTitle}>{course.title}</h3>
                      <p className={courseStyles.cardDesc}>{course.shortDescription}</p>

                      <div className={courseStyles.cardMeta}>
                        <div className={courseStyles.rating}>
                          <Star size={13} fill="#eab308" stroke="#eab308" />
                          <span>{course.rating || '0'}</span>
                        </div>
                        <span>•</span>
                        <Clock size={12} style={{ opacity: 0.5 }} />
                        <span>{course.duration}</span>
                        <span>•</span>
                        <BookOpen size={12} style={{ opacity: 0.5 }} />
                        <span>{course.lessonsCount} lessons</span>
                      </div>

                      <div className={courseStyles.cardBottom}>
                        {trainer ? (
                          <div className={courseStyles.cardTrainer}>
                            <div className={courseStyles.trainerDot} style={{ background: accent }}>
                              {trainer.name.charAt(0)}
                            </div>
                            <div className={courseStyles.trainerInfo}>
                              <span className={courseStyles.trainerName}>{trainer.name}</span>
                              <span className={courseStyles.trainerLabel}>Instructor</span>
                            </div>
                          </div>
                        ) : <div />}

                        <div className={courseStyles.priceBlock}>
                          <div className={courseStyles.price}>
                            {course.discountPrice && (
                              <span className={courseStyles.oldPrice}>₹{course.price}</span>
                            )}
                            <span className={courseStyles.currentPrice}>
                              ₹{course.discountPrice ?? course.price}
                            </span>
                          </div>
                          <div className={courseStyles.arrowBtn} style={{ background: accent }}>
                            <ArrowRight size={15} color="white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ILLUSTRATION */}
                    <div className={courseStyles.cardIllustration}>
                      <TechIllustration
                        title={course.title}
                        category={course.category}
                        size={110}
                      />
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {filteredCourses.length === 0 && (
          <FadeInUp>
            <div className={styles.emptyState}>
              <p>No courses found. Create your first course!</p>
            </div>
          </FadeInUp>
        )}

        {/* ── ADD/EDIT MODAL ── */}
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
                className={`modal-content ${styles.modalWide}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
                  <button className="modal-close" onClick={() => !isLoading && setShowModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Course Title *</label>
                      <input type="text" className="input-field" value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <select className="input-field" value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        disabled={isLoading}>
                        {['Web Development','Python','Java','C++','Data Science','Cloud Computing','DevOps','Cybersecurity','Other'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Assign Trainer *</label>
                      <select className="input-field" value={form.trainerId}
                        onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                        required disabled={isLoading}>
                        <option value="">Select trainer...</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} — {t.specialization}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Level</label>
                      <select className="input-field" value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                        disabled={isLoading}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Price (₹) *</label>
                      <input type="number" className="input-field" value={form.price || ''}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Discount Price (₹)</label>
                      <input type="number" className="input-field" value={form.discountPrice || ''}
                        onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                        disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Duration</label>
                      <input type="text" className="input-field" value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Lessons Count</label>
                      <input type="number" className="input-field" value={form.lessonsCount || ''}
                        onChange={(e) => setForm({ ...form, lessonsCount: Number(e.target.value) })}
                        disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Published</label>
                      <select className="input-field" value={form.isPublished ? 'yes' : 'no'}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'yes' })}
                        disabled={isLoading}>
                        <option value="yes">Published</option>
                        <option value="no">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Short Description</label>
                    <input type="text" className="input-field" value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      disabled={isLoading} />
                  </div>
                  <div className="input-group">
                    <label>Full Description</label>
                    <textarea className="input-field textarea-field" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      disabled={isLoading} />
                  </div>
                  <div className="input-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" className="input-field" value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="input-group">
                    <label>Syllabus (one topic per line)</label>
                    <textarea className="input-field textarea-field" value={syllabusInput}
                      onChange={(e) => setSyllabusInput(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary"
                      onClick={() => setShowModal(false)} disabled={isLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DELETE CONFIRM MODAL ── */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setDeleteConfirm(null)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.deleteModal}>
                  <div className={styles.deleteIcon}><Trash2 size={28} /></div>
                  <h3>Delete Course?</h3>
                  <p>This action cannot be undone. The course will be permanently removed.</p>
                  <div className={styles.deleteActions}>
                    <button className="btn btn-secondary"
                      onClick={() => setDeleteConfirm(null)} disabled={isLoading}>
                      Cancel
                    </button>
                    <button className="btn btn-danger"
                      onClick={() => handleDelete(deleteConfirm)} disabled={isLoading}>
                      {isLoading ? 'Deleting...' : 'Delete Course'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

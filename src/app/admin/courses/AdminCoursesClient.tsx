'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, X, Eye, EyeOff, Star, Users as UsersIcon } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createCourse, updateCourse, deleteCourse } from '@/lib/actions';
import styles from './page.module.css';
import { CourseWithArrays } from '@/lib/utils';
import { Trainer } from '@/generated/prisma/client';

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
  trainers 
}: { 
  initialCourses: CourseWithArrays[], 
  trainers: Trainer[] 
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
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      alert('Error deleting course');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (course: CourseWithArrays) => {
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageTransition>
      <div className={styles.page}>
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

        <StaggerContainer className={styles.coursesGrid}>
          {filteredCourses.map((course) => {
            const trainer = trainers.find((t) => t.id === course.trainerId);
            return (
              <StaggerItem key={course.id}>
                <motion.div
                  className={styles.courseCard}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardLogo}>{course.logo}</div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => togglePublish(course)}
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {course.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button className={styles.actionBtn} onClick={() => openEditModal(course)} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => setDeleteConfirm(course.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <h3 className={styles.cardTitle}>{course.title}</h3>
                    <p className={styles.cardDesc}>{course.shortDescription}</p>
                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <Star size={14} fill="#fdcb6e" stroke="#fdcb6e" />
                        <span>{course.rating || 'N/A'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <UsersIcon size={14} />
                        <span>{course.studentsEnrolled}</span>
                      </div>
                      <span className={`badge badge-primary`}>{course.level}</span>
                    </div>

                    {trainer && (
                      <div className={styles.cardTrainer}>
                        <div className={styles.trainerDot}>{trainer.name.charAt(0)}</div>
                        <span>{trainer.name}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardPrice}>
                      {course.discountPrice ? (
                        <>
                          <span className={styles.oldPrice}>₹{course.price}</span>
                          <span className={styles.currentPrice}>₹{course.discountPrice}</span>
                        </>
                      ) : (
                        <span className={styles.currentPrice}>₹{course.price}</span>
                      )}
                    </div>
                    <span className={styles.cardDuration}>{course.duration}</span>
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
                      <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Category</label>
                      <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={isLoading}>
                        <option>Web Development</option>
                        <option>Design</option>
                        <option>Data Science</option>
                        <option>Mobile Development</option>
                        <option>Cloud Computing</option>
                        <option>DevOps</option>
                        <option>Cybersecurity</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Logo Emoji</label>
                      <input type="text" className="input-field" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Assign Trainer *</label>
                      <select className="input-field" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })} required disabled={isLoading}>
                        <option value="">Select trainer...</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} — {t.specialization}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Price (₹) *</label>
                      <input type="number" className="input-field" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Discount Price (₹)</label>
                      <input type="number" className="input-field" value={form.discountPrice || ''} onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : undefined })} disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Level</label>
                      <select className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} disabled={isLoading}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Duration</label>
                      <input type="text" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Lessons Count</label>
                      <input type="number" className="input-field" value={form.lessonsCount || ''} onChange={(e) => setForm({ ...form, lessonsCount: Number(e.target.value) })} disabled={isLoading} />
                    </div>

                    <div className="input-group">
                      <label>Published</label>
                      <select className="input-field" value={form.isPublished ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'yes' })} disabled={isLoading}>
                        <option value="yes">Published</option>
                        <option value="no">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Short Description</label>
                    <input type="text" className="input-field" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} disabled={isLoading} />
                  </div>

                  <div className="input-group">
                    <label>Full Description</label>
                    <textarea className="input-field textarea-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isLoading} />
                  </div>

                  <div className="input-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" className="input-field" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className="input-group">
                    <label>Syllabus (one topic per line)</label>
                    <textarea className="input-field textarea-field" value={syllabusInput} onChange={(e) => setSyllabusInput(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={isLoading}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={isLoading}>
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

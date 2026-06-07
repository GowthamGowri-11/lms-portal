'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, X, Star, BookOpen, Users as UsersIcon } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createTrainer, updateTrainer, deleteTrainer } from '@/lib/actions';
import styles from './page.module.css';
import { Trainer, Course } from '@/generated/prisma/client';

const emptyForm = {
  name: '',
  email: '',
  specialization: '',
  bio: '',
  avatar: '',
  experience: '',
};

export default function AdminTrainersClient({ 
  initialTrainers, 
  courses 
}: { 
  initialTrainers: Trainer[], 
  courses: Course[] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredTrainers = initialTrainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingTrainer(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setForm({
      name: trainer.name,
      email: trainer.email,
      specialization: trainer.specialization,
      bio: trainer.bio,
      avatar: trainer.avatar,
      experience: trainer.experience,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTrainer) {
        await updateTrainer(editingTrainer.id, form);
      } else {
        await createTrainer(form);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error saving trainer. Ensure email is unique.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTrainer(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      alert('Error deleting trainer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        <FadeInUp>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Trainers</h1>
              <p className={styles.subtitle}>Manage your expert trainers and their profiles.</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Trainer
            </button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search trainers by name or specialization..."
              className={`input-field ${styles.searchInput}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </FadeInUp>

        <StaggerContainer className={styles.trainersGrid}>
          {filteredTrainers.map((trainer) => {
            const trainerCourses = courses.filter((c) => c.trainerId === trainer.id);
            // Mocking studentsCount since we don't have robust enrollments logic yet
            const mockStudents = Math.floor(Math.random() * 500) + 50;
            return (
              <StaggerItem key={trainer.id}>
                <motion.div
                  className={styles.trainerCard}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => openEditModal(trainer)} title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => setDeleteConfirm(trainer.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.trainerAvatar}>{trainer.name.charAt(0)}</div>
                  <h3 className={styles.trainerName}>{trainer.name}</h3>
                  <span className={styles.trainerSpec}>{trainer.specialization}</span>
                  <p className={styles.trainerBio}>{trainer.bio.slice(0, 100)}{trainer.bio.length > 100 ? '...' : ''}</p>

                  <div className={styles.trainerStats}>
                    <div className={styles.statItem}>
                      <BookOpen size={16} />
                      <div>
                        <strong>{trainerCourses.length}</strong>
                        <span>Courses</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <UsersIcon size={16} />
                      <div>
                        <strong>{mockStudents}</strong>
                        <span>Students</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <Star size={16} />
                      <div>
                        <strong>{trainer.rating || 'N/A'}</strong>
                        <span>Rating</span>
                      </div>
                    </div>
                  </div>

                  {trainerCourses.length > 0 && (
                    <div className={styles.assignedCourses}>
                      <span className={styles.assignedLabel}>Assigned Courses:</span>
                      <div className={styles.assignedList}>
                        {trainerCourses.map((c) => (
                          <span key={c.id} className={styles.assignedChip}>
                            {c.logo} {c.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {filteredTrainers.length === 0 && (
          <FadeInUp>
            <div className={styles.emptyState}>
              <p>No trainers found. Add your first trainer!</p>
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
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
                  <button className="modal-close" onClick={() => !isLoading && setShowModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Email *</label>
                      <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Specialization *</label>
                      <input type="text" className="input-field" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Experience</label>
                      <input type="text" className="input-field" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} disabled={isLoading} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Bio</label>
                    <textarea className="input-field textarea-field" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} disabled={isLoading} />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingTrainer ? 'Update Trainer' : 'Add Trainer')}
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
                  <h3>Delete Trainer?</h3>
                  <p>This will permanently remove the trainer and all associated courses.</p>
                  <div className={styles.deleteActions}>
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={isLoading}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={isLoading}>
                      {isLoading ? 'Deleting...' : 'Delete Trainer'}
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

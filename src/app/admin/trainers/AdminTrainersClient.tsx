'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createTrainer, updateTrainer, deleteTrainer } from '@/lib/actions';
import TrainerCard from '@/components/ui/TrainerCard';
import styles from './page.module.css';
import { Trainer } from '@/generated/prisma/client';

const emptyForm = {
  name: '',
  email: '',
  specialization: '',
  bio: '',
  avatar: '',
  experience: '',
  rating: 0,
};

export default function AdminTrainersClient({
  initialTrainers,
  courses,
}: {
  initialTrainers: Trainer[];
  courses: { id: string; title: string; logo: string; trainerId: string }[];
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
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase()),
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
      rating: trainer.rating || 0,
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert('Error deleting trainer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Header */}
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

        {/* Search */}
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

        {/* Trainer Cards */}
        <StaggerContainer className={styles.trainersGrid}>
          {filteredTrainers.map((trainer) => (
            <StaggerItem key={trainer.id}>
              <TrainerCard
                trainer={trainer}
                courses={courses}
                isAdmin
                onEdit={openEditModal}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {filteredTrainers.length === 0 && (
          <FadeInUp>
            <div className={styles.emptyState}>
              <p>No trainers found. Add your first trainer!</p>
            </div>
          </FadeInUp>
        )}

        {/* ── ADD / EDIT MODAL ── */}
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
                      <input type="text" className="input-field" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Email *</label>
                      <input type="email" className="input-field" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Specialization *</label>
                      <input type="text" className="input-field" value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                        required disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Experience (e.g. 5 years)</label>
                      <input type="text" className="input-field" value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Rating (0–5)</label>
                      <input type="number" min="0" max="5" step="0.1" className="input-field"
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                        disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Avatar URL (optional)</label>
                      <input type="text" className="input-field" value={form.avatar}
                        placeholder="https://..."
                        onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                        disabled={isLoading} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Bio</label>
                    <textarea className="input-field textarea-field" value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      disabled={isLoading} />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary"
                      onClick={() => setShowModal(false)} disabled={isLoading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : editingTrainer ? 'Update Trainer' : 'Add Trainer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DELETE CONFIRM ── */}
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
                    <button className="btn btn-secondary"
                      onClick={() => setDeleteConfirm(null)} disabled={isLoading}>
                      Cancel
                    </button>
                    <button className="btn btn-danger"
                      onClick={() => handleDelete(deleteConfirm)} disabled={isLoading}>
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

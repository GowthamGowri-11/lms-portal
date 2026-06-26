'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, X, Code } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createDeveloper, updateDeveloper, deleteDeveloper } from '@/lib/actions';
import ViewResumeButton from '@/components/ui/ViewResumeButton';
import styles from './page.module.css';
import { Developer } from '@/generated/prisma/client';

const emptyForm = {
  name: '',
  role: '',
  bio: '',
  avatar: '',
  github: '',
  linkedin: '',
  resume: '',
};

export default function AdminDevelopersClient({ 
  initialDevelopers 
}: { 
  initialDevelopers: Developer[] 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDev, setEditingDev] = useState<Developer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredDevs = initialDevelopers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingDev(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (dev: Developer) => {
    setEditingDev(dev);
    setForm({
      name: dev.name || '',
      role: dev.role || '',
      bio: dev.bio || '',
      avatar: dev.avatar || '',
      github: dev.github || '',
      linkedin: dev.linkedin || '',
      resume: dev.resume || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingDev) {
        await updateDeveloper(editingDev.id, form);
      } else {
        await createDeveloper(form);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error saving developer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDeveloper(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      alert('Error deleting developer.');
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
              <h1 className={styles.title}>Developers</h1>
              <p className={styles.subtitle}>Manage the engineering team behind the platform.</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Developer
            </button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search developers by name or role..."
              className={`input-field ${styles.searchInput}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </FadeInUp>

        <StaggerContainer className={styles.devsGrid}>
          {filteredDevs.map((dev) => (
            <StaggerItem key={dev.id}>
              <motion.div
                className={styles.devCard}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => openEditModal(dev)} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => setDeleteConfirm(dev.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.avatarContainer}>
                  {dev.avatar ? (
                    <img src={dev.avatar} alt={dev.name} className={styles.avatarImage} />
                  ) : (
                    <Code size={32} />
                  )}
                </div>
                
                <h3 className={styles.devName}>{dev.name}</h3>
                <span className={styles.devRole}>{dev.role}</span>
                <p className={styles.devBio}>{dev.bio.slice(0, 100)}{dev.bio.length > 100 ? '...' : ''}</p>

                <div className={styles.devLinks}>
                  {dev.github && (
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.39-3.23 4.08 4.08 0 0 0-.13-3.19s-1.12-.36-3.66 1.25a12.8 12.8 0 0 0-6.6 0C6.12 2.1 5 2.46 5 2.46a4.08 4.08 0 0 0-.13 3.19 4.6 4.6 0 0 0-1.39 3.23c0 5.6 3.36 6.65 6.5 7a4.8 4.8 0 0 0-1 3.02V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
                    </a>
                  )}
                  {dev.linkedin && (
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  )}
                </div>
                {dev.resume && (
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <ViewResumeButton resumeUrl={dev.resume} />
                  </div>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {filteredDevs.length === 0 && (
          <FadeInUp>
            <div className={styles.emptyState}>
              <p>No developers found. Add your first developer!</p>
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
                  <h2>{editingDev ? 'Edit Developer' : 'Add New Developer'}</h2>
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
                      <label>Role *</label>
                      <input type="text" className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required placeholder="e.g. Full Stack Developer" disabled={isLoading} />
                    </div>
                    <div className="input-group">
                      <label>Avatar Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="input-field" 
                        style={{ padding: '8px' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setForm({ ...form, avatar: reader.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} 
                        disabled={isLoading} 
                      />
                      {form.avatar && (
                        <div style={{ marginTop: '10px' }}>
                          <img src={form.avatar} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>
                    <div className="input-group">
                      <label>GitHub URL</label>
                      <input type="text" className="input-field" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." disabled={isLoading} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>LinkedIn URL</label>
                    <input type="text" className="input-field" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." disabled={isLoading} />
                  </div>

                  <div className="input-group">
                    <label>Resume (PDF File)</label>
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf" 
                      className="input-field" 
                      style={{ padding: '8px' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setForm({ ...form, resume: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} 
                      disabled={isLoading} 
                    />
                    {form.resume && (
                      <div style={{ marginTop: '5px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                        ✓ Resume file attached
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Bio</label>
                    <textarea className="input-field textarea-field" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} disabled={isLoading} />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingDev ? 'Update Developer' : 'Add Developer')}
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
                  <h3>Delete Developer?</h3>
                  <p>This will permanently remove the developer profile from the system.</p>
                  <div className={styles.deleteActions}>
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={isLoading}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={isLoading}>
                      {isLoading ? 'Deleting...' : 'Delete'}
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

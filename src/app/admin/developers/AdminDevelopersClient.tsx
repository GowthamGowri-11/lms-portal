'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, X, Code, Upload, RefreshCw } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { createDeveloper, updateDeveloper, deleteDeveloper } from '@/lib/actions';
import ViewResumeButton from '@/components/ui/ViewResumeButton';
import styles from './page.module.css';
import { Developer } from '@/generated/prisma/client';

const emptyForm = {
  name:     '',
  role:     '',
  bio:      '',
  avatar:   '',   // stores the Cloudinary secure URL once uploaded
  github:   '',
  linkedin: '',
  resume:   '',
};

// ── tiny helpers ──────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_MB        = 5;

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPG, PNG or WebP images are allowed.';
  if (file.size > MAX_MB * 1024 * 1024)   return `Image must be smaller than ${MAX_MB} MB.`;
  return null;
}

export default function AdminDevelopersClient({
  initialDevelopers,
}: {
  initialDevelopers: Developer[];
}) {
  const [searchQuery,  setSearchQuery]  = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editingDev,   setEditingDev]   = useState<Developer | null>(null);
  const [form,         setForm]         = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving,     setIsSaving]     = useState(false);

  // Cloudinary upload state — local to the modal
  const [avatarFile,      setAvatarFile]      = useState<File | null>(null);
  const [avatarPreview,   setAvatarPreview]   = useState<string>('');  // object URL for preview
  const [avatarPublicId,  setAvatarPublicId]  = useState<string>('');  // existing public_id when editing
  const [isUploading,     setIsUploading]     = useState(false);
  const [uploadError,     setUploadError]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── filtered list ──────────────────────────────────────────────────────────
  const filteredDevs = initialDevelopers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── open modals ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingDev(null);
    setForm(emptyForm);
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarPublicId('');
    setUploadError('');
    setShowModal(true);
  };

  const openEditModal = (dev: Developer) => {
    setEditingDev(dev);
    setForm({
      name:     dev.name     || '',
      role:     dev.role     || '',
      bio:      dev.bio      || '',
      avatar:   dev.avatar   || '',
      github:   dev.github   || '',
      linkedin: dev.linkedin || '',
      resume:   dev.resume   || '',
    });
    setAvatarFile(null);
    // Show current avatar as preview
    setAvatarPreview(dev.avatar || '');
    // Extract publicId from the stored URL if it starts with our folder
    setAvatarPublicId(''); // we'll fetch the public_id via the DB if needed; for now rely on URL
    setUploadError('');
    setShowModal(true);
  };

  // ── pick image file ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) { setUploadError(err); return; }
    setUploadError('');
    setAvatarFile(file);
    // Show local preview immediately (revoke old one if any)
    setAvatarPreview((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  // ── upload to Cloudinary via our API route ─────────────────────────────────
  const uploadAvatar = async (file: File): Promise<{ secureUrl: string; publicId: string } | null> => {
    setIsUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res  = await fetch('/api/admin/developers/avatar', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed.');
        return null;
      }
      return { secureUrl: data.secureUrl, publicId: data.publicId };
    } catch {
      setUploadError('Network error during upload.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // ── delete old Cloudinary asset ────────────────────────────────────────────
  const deleteOldAvatar = async (publicId: string) => {
    if (!publicId) return;
    try {
      await fetch('/api/admin/developers/avatar', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ publicId }),
      });
    } catch {
      // Non-fatal — don't block saving
    }
  };

  // ── submit form ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let avatarUrl = form.avatar;

      if (avatarFile) {
        // If editing and there's an existing Cloudinary image, delete it first
        if (editingDev?.avatar && editingDev.avatar.includes('cloudinary.com')) {
          // Extract publicId from URL:  .../indra-lms/developers/<public_id>.<ext>
          const match = editingDev.avatar.match(/indra-lms\/developers\/[^.?]+/);
          if (match) await deleteOldAvatar(match[0]);
        }

        const uploaded = await uploadAvatar(avatarFile);
        if (!uploaded) {
          setIsSaving(false);
          return; // uploadError already set
        }
        avatarUrl = uploaded.secureUrl;
      }

      const payload = { ...form, avatar: avatarUrl };

      if (editingDev) {
        await updateDeveloper(editingDev.id, payload);
      } else {
        await createDeveloper(payload);
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Error saving developer.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── delete developer (+ Cloudinary image) ─────────────────────────────────
  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      // Find the dev to get avatar URL
      const dev = initialDevelopers.find((d) => d.id === id);
      if (dev?.avatar && dev.avatar.includes('cloudinary.com')) {
        const match = dev.avatar.match(/indra-lms\/developers\/[^.?]+/);
        if (match) await deleteOldAvatar(match[0]);
      }

      await deleteDeveloper(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Error deleting developer.');
    } finally {
      setIsSaving(false);
    }
  };

  const isWorking = isSaving || isUploading;

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* ── HEADER ── */}
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

        {/* ── SEARCH ── */}
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

        {/* ── CARDS — layout unchanged ── */}
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
                  <button
                    className={`${styles.actionBtn} ${styles.actionDanger}`}
                    onClick={() => setDeleteConfirm(dev.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Avatar — real photo or placeholder icon */}
                <div className={styles.avatarContainer}>
                  {dev.avatar ? (
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className={styles.avatarImage}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                  ) : (
                    <Code size={32} />
                  )}
                </div>

                <h3 className={styles.devName}>{dev.name}</h3>
                <span className={styles.devRole}>{dev.role}</span>
                <p className={styles.devBio}>
                  {dev.bio.slice(0, 100)}{dev.bio.length > 100 ? '...' : ''}
                </p>

                <div className={styles.devLinks}>
                  {dev.github && (
                    <a href={dev.github} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.39-3.23 4.08 4.08 0 0 0-.13-3.19s-1.12-.36-3.66 1.25a12.8 12.8 0 0 0-6.6 0C6.12 2.1 5 2.46 5 2.46a4.08 4.08 0 0 0-.13 3.19 4.6 4.6 0 0 0-1.39 3.23c0 5.6 3.36 6.65 6.5 7a4.8 4.8 0 0 0-1 3.02V22"/>
                        <path d="M9 20c-5 1.5-5-2.5-7-3"/>
                      </svg>
                    </a>
                  )}
                  {dev.linkedin && (
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect width="4" height="12" x="2" y="9"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
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

        {/* ── ADD / EDIT MODAL ── */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isWorking && setShowModal(false)}
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
                  <button className="modal-close" onClick={() => !isWorking && setShowModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input
                        type="text" className="input-field" value={form.name} required
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={isWorking}
                      />
                    </div>
                    <div className="input-group">
                      <label>Role *</label>
                      <input
                        type="text" className="input-field" value={form.role} required
                        placeholder="e.g. Full Stack Developer"
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        disabled={isWorking}
                      />
                    </div>
                    <div className="input-group">
                      <label>GitHub URL</label>
                      <input
                        type="text" className="input-field" value={form.github}
                        placeholder="https://github.com/..."
                        onChange={(e) => setForm({ ...form, github: e.target.value })}
                        disabled={isWorking}
                      />
                    </div>
                    <div className="input-group">
                      <label>LinkedIn URL</label>
                      <input
                        type="text" className="input-field" value={form.linkedin}
                        placeholder="https://linkedin.com/in/..."
                        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                        disabled={isWorking}
                      />
                    </div>
                  </div>

                  {/* ── PROFILE PHOTO UPLOAD ── */}
                  <div className="input-group">
                    <label>Profile Photo</label>

                    <div className={styles.photoUploadRow}>
                      {/* Avatar preview */}
                      <div className={styles.photoPreview}>
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Preview"
                            className={styles.photoPreviewImg}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            loading="lazy"
                          />
                        ) : (
                          <Code size={28} style={{ color: 'var(--text-tertiary)' }} />
                        )}
                      </div>

                      {/* Upload button */}
                      <div className={styles.photoActions}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isWorking}
                        >
                          {isUploading
                            ? <><RefreshCw size={14} className={styles.spin} /> Uploading…</>
                            : <><Upload size={14} /> {avatarPreview ? 'Replace Photo' : 'Upload Photo'}</>
                          }
                        </button>

                        {avatarPreview && !isUploading && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent-danger)', fontSize: '0.78rem' }}
                            onClick={() => {
                              setAvatarFile(null);
                              if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
                              setAvatarPreview('');
                              setForm((f) => ({ ...f, avatar: '' }));
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            disabled={isWorking}
                          >
                            Remove
                          </button>
                        )}

                        <span className={styles.photoHint}>
                          JPG, PNG, WebP · max {MAX_MB} MB
                        </span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      hidden
                      onChange={handleFileChange}
                    />

                    {uploadError && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', marginTop: 4 }}>
                        {uploadError}
                      </span>
                    )}
                  </div>

                  {/* Resume */}
                  <div className="input-group">
                    <label>Resume URL (optional)</label>
                    <input
                      type="text" className="input-field" value={form.resume}
                      placeholder="https://..."
                      onChange={(e) => setForm({ ...form, resume: e.target.value })}
                      disabled={isWorking}
                    />
                  </div>

                  <div className="input-group">
                    <label>Bio</label>
                    <textarea
                      className="input-field textarea-field" value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      disabled={isWorking}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button" className="btn btn-secondary"
                      onClick={() => setShowModal(false)} disabled={isWorking}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isWorking}>
                      {isWorking
                        ? <><RefreshCw size={15} className={styles.spin} /> Saving…</>
                        : editingDev ? 'Update Developer' : 'Add Developer'
                      }
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
              onClick={() => !isWorking && setDeleteConfirm(null)}
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
                  <p>
                    This will permanently remove the developer profile
                    {initialDevelopers.find((d) => d.id === deleteConfirm)?.avatar
                      ? ' and their Cloudinary profile photo'
                      : ''}.
                  </p>
                  <div className={styles.deleteActions}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setDeleteConfirm(null)}
                      disabled={isWorking}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(deleteConfirm)}
                      disabled={isWorking}
                    >
                      {isWorking
                        ? <><RefreshCw size={14} className={styles.spin} /> Deleting…</>
                        : 'Delete'
                      }
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

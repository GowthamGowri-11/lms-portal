'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit3, User, ShieldAlert, X, RefreshCw, Eye, BookOpen, GraduationCap, Phone, Clock } from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/animations/MotionWrappers';
import { User as PrismaUser } from '@/generated/prisma/client';

// Shared styles from other admin pages, we can just use inline for simplicity or reuse classes
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'badge-danger';
    case 'TRAINER': return 'badge-warning';
    case 'DEVELOPER': return 'badge-info'; // assuming a style exists, or fallback
    case 'STUDENT': return 'badge-success';
    default: return 'badge-secondary';
  }
};

export default function AdminUsersClient({ 
  initialUsers,
  courses
}: { 
  initialUsers: PrismaUser[];
  courses: { id: string; title: string; logo?: string }[];
}) {
  const [users, setUsers] = useState<PrismaUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterCourse, setFilterCourse] = useState('ALL');
  
  // Modals state
  const [viewUser, setViewUser] = useState<PrismaUser | null>(null);
  const [editUser, setEditUser] = useState<PrismaUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PrismaUser | null>(null);
  
  // Action state
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    
    let matchesCourse = true;
    if (filterCourse !== 'ALL') {
      // Only students can have enrollments in this data structure
      const enrollments = (u as any).student?.enrollments || [];
      matchesCourse = enrollments.some((e: any) => e.courseId === filterCourse);
    }

    return matchesSearch && matchesRole && matchesCourse;
  });

  const handleOpenEdit = (user: PrismaUser) => {
    setEditUser(user);
    setSelectedRole(user.role);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update role');
      }
      
      setUsers(users.map(u => u.id === editUser.id ? { ...u, role: selectedRole } : u));
      setEditUser(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error updating user role.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setUsers(users.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error deleting user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition>
      <div style={{ padding: '2rem' }}>
        <FadeInUp>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Users Management</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Manage all accounts, assign roles, and remove unused users.</p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter by Role */}
            <div style={{ width: '200px' }}>
              <select 
                className="input-field" 
                value={filterRole} 
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  // If changing to anything other than STUDENT, clear the course filter
                  if (e.target.value !== 'STUDENT' && e.target.value !== 'ALL') {
                    setFilterCourse('ALL');
                  }
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="TRAINER">Trainer</option>
                <option value="DEVELOPER">Developer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Filter by Course (Only relevant for Students) */}
            {(filterRole === 'ALL' || filterRole === 'STUDENT') && (
              <div style={{ width: '250px' }}>
                <select 
                  className="input-field" 
                  value={filterCourse} 
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <option value="ALL">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover-row">
                    <td>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => setViewUser(user)}
                        title="View Full Overview"
                      >
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                        }}>
                          {user.image ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', transition: 'color 0.2s' }} className="user-name-hover">{user.name || 'No Name'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeColor(user.role)}`} style={{
                        background: user.role === 'DEVELOPER' ? 'rgba(59, 130, 246, 0.15)' : undefined,
                        color: user.role === 'DEVELOPER' ? '#3b82f6' : undefined
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => setViewUser(user)}
                        title="View Overview"
                        style={{ padding: '0.4rem', marginRight: '0.2rem', color: 'var(--text-secondary)' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleOpenEdit(user)}
                        title="Change Role"
                        style={{ padding: '0.4rem', marginRight: '0.2rem' }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => setDeleteConfirm(user)}
                        title="Delete User"
                        style={{ padding: '0.4rem', color: 'var(--accent-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </FadeInUp>

        {/* View User Overview Modal */}
        <AnimatePresence>
          {viewUser && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewUser(null)}
              style={{ 
                padding: '1rem', 
                alignItems: 'center', 
                display: 'flex', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', 
                  padding: 0, borderRadius: '24px', position: 'relative',
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.05)', 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  color: '#111827' // Dark text for light theme
                }}
              >
                {/* Decorative header background */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)', zIndex: 0, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', pointerEvents: 'none', borderBottom: '1px solid rgba(0,0,0,0.03)' }} />

                {/* Header Profile Section */}
                <div style={{ padding: '2.5rem 2.5rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <button onClick={() => setViewUser(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', color: '#6b7280', padding: '8px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#111827' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#6b7280' }}>
                    <X size={20} />
                  </button>
                  
                  <div style={{
                    width: '90px', height: '90px', borderRadius: '50%', background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0,
                    border: '4px solid #ffffff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}>
                    {viewUser.image ? <img src={viewUser.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={40} />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem 0', letterSpacing: '-0.02em', color: '#111827' }}>{viewUser.name || 'No Name'}</h2>
                    <div style={{ color: '#6b7280', marginBottom: '0.85rem', fontSize: '0.95rem' }}>{viewUser.email}</div>
                    <span className={`badge ${getRoleBadgeColor(viewUser.role)}`} style={{
                        background: viewUser.role === 'DEVELOPER' ? '#eff6ff' : undefined,
                        color: viewUser.role === 'DEVELOPER' ? '#2563eb' : undefined,
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', letterSpacing: '0.05em'
                    }}>
                      <ShieldAlert size={14} /> {viewUser.role}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '2.5rem', position: 'relative', zIndex: 1 }}>
                  {/* Details Section */}
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#111827' }}>
                      <User size={18} style={{ color: '#10b981' }} /> Profile Data
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                      <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Phone</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{viewUser.phone || <span style={{ color: '#9ca3af', fontWeight: 400 }}>Not provided</span>}</div>
                      </div>
                      <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Age</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{viewUser.age || <span style={{ color: '#9ca3af', fontWeight: 400 }}>Not provided</span>}</div>
                      </div>
                      <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Education</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{viewUser.education || <span style={{ color: '#9ca3af', fontWeight: 400 }}>Not provided</span>}</div>
                      </div>
                      <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Joined Date</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>{new Date(viewUser.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.4rem' }}>Onboarded</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: viewUser.isOnboarded ? '#10b981' : '#9ca3af' }}>{viewUser.isOnboarded ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments Section */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#111827' }}>
                      <BookOpen size={18} style={{ color: '#10b981' }} /> Courses Enrolled
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {((viewUser as any).student?.enrollments || []).length > 0 ? (
                        ((viewUser as any).student.enrollments).map((enrollment: any, idx: number) => {
                          const course = courses.find(c => c.id === enrollment.courseId);
                          return (
                            <motion.div 
                              key={enrollment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              style={{ 
                                background: '#ffffff', 
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                                borderRadius: '16px',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                gap: '1.5rem',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                              }}
                            >
                              <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                {course?.logo ? (
                                  <img src={course.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <BookOpen size={24} style={{ color: '#9ca3af' }} />
                                )}
                              </div>
                              
                              <div style={{ flex: '1 1 200px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{course?.title || 'Unknown Course'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div style={{ flex: '1 1 150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                  <span style={{ color: '#6b7280' }}>Status: <strong style={{ color: enrollment.paymentStatus === 'completed' ? '#10b981' : enrollment.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444', textTransform: 'capitalize' }}>{enrollment.paymentStatus}</strong></span>
                                  <span style={{ fontWeight: 700, color: '#111827' }}>{enrollment.progress}%</span>
                                </div>
                                
                                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${enrollment.progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (idx * 0.1) }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '16px', border: '1px dashed #d1d5db', color: '#6b7280' }}>
                          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                          <p>This user has not enrolled in any courses yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Role Modal */}
        <AnimatePresence>
          {editUser && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setEditUser(null)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Change User Role</h2>
                  <button className="modal-close" onClick={() => !isSaving && setEditUser(null)}>
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateRole} style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Assign a new role to <strong>{editUser.name || editUser.email}</strong>.
                    </p>
                    <div className="input-group">
                      <label>Role</label>
                      <select 
                        className="input-field" 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={isSaving}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="DEVELOPER">Developer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)} disabled={isSaving}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? <><RefreshCw size={14} className="spin" style={{ marginRight: 8 }}/> Saving...</> : 'Update Role'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setDeleteConfirm(null)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', 
                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <ShieldAlert size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Delete {deleteConfirm.name || 'User'}?</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                    This will permanently remove their account, and <strong>deeply delete</strong> all associated records including their enrollments, progress, and courses they created. This action cannot be undone.
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={isSaving}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteUser} disabled={isSaving}>
                      {isSaving ? <><RefreshCw size={14} className="spin" style={{ marginRight: 8 }}/> Deleting...</> : 'Yes, Delete Completely'}
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

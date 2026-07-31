'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit3, User, ShieldAlert, X, RefreshCw } from 'lucide-react';
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
  courses: { id: string; title: string }[];
}) {
  const [users, setUsers] = useState<PrismaUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterCourse, setFilterCourse] = useState('ALL');
  
  // Modals state
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
      
      if (!res.ok) throw new Error('Failed to update role');
      
      setUsers(users.map(u => u.id === editUser.id ? { ...u, role: selectedRole } : u));
      setEditUser(null);
    } catch (err) {
      console.error(err);
      alert('Error updating user role.');
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
                <option value="GUEST">Guest</option>
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
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                        }}>
                          {user.image ? <img src={user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name || 'No Name'}</div>
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
                        onClick={() => handleOpenEdit(user)}
                        title="Change Role"
                        style={{ padding: '0.4rem', marginRight: '0.5rem' }}
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
                        <option value="GUEST">Guest (Unonboarded)</option>
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

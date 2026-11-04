'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, BookOpen, Award, Search, UserPlus, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import styles from './page.module.css';
import { CourseWithArrays, exportToCSV } from '@/lib/utils';
import { Student, Enrollment } from '@/generated/prisma/client';

type StudentRow = Student & { user?: { isOnboarded: boolean } | null };

export default function AdminStudentsClient({
  students,
  courses,
  enrollments: initialEnrollments
}: {
  students: StudentRow[],
  courses: CourseWithArrays[],
  enrollments: Enrollment[]
}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);

  // Assign modal state
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignAlert, setAssignAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAssignSubmit = async () => {
    if (!assignStudent || !assignCourseId) return;

    setIsAssigning(true);
    setAssignAlert(null);

    try {
      const res = await fetch('/api/admin/courses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: assignCourseId,
          studentIds: [assignStudent.id],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign course');

      setAssignAlert({
        type: 'success',
        message: 'Course assigned! Automated notification email dispatched.',
      });

      // Update local enrollments
      setEnrollments((prev) => [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          studentId: assignStudent.id,
          courseId: assignCourseId,
          progress: 0,
          paymentStatus: 'assigned',
          enrolledAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ]);

      setTimeout(() => {
        setAssignStudent(null);
        setAssignCourseId('');
      }, 1400);
    } catch (err: any) {
      setAssignAlert({
        type: 'error',
        message: err.message || 'Error assigning course',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Course Filter
      if (selectedCourseId !== 'all') {
        const isEnrolled = enrollments.some(
          e => e.studentId === student.id && e.courseId === selectedCourseId
        );
        if (!isEnrolled) return false;
      }
      
      // 2. Search Filter (Name or Email)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      if (statusFilter === 'active' && student.user && !student.user.isOnboarded) return false;
      if (statusFilter === 'pending' && student.user && student.user.isOnboarded) return false;
      
      return true;
    });
  }, [students, enrollments, searchQuery, selectedCourseId, statusFilter]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newStudents = students.filter((s) => new Date(s.createdAt).getTime() >= weekAgo).length;
  const activeStudents = students.filter((s) => !s.user || s.user.isOnboarded).length;

  return (
    <PageTransition>
      <div className={styles.page}>
        <FadeInUp>
          <div className={styles.header}>
            <h1 className={styles.title}>Students</h1>
            <p className={styles.subtitle}>View enrolled students and their progress.</p>
          </div>
        </FadeInUp>

        <FadeInUp>
          <div className={styles.filterNav}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by student name or email (gmail)..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className={styles.courseSelect}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => exportToCSV(
                filteredStudents.map(s => ({
                  name: s.name,
                  email: s.email,
                  registered: new Date(s.createdAt).toLocaleDateString(),
                  enrolledCourses: enrollments.filter(e => e.studentId === s.id).length,
                  status: s.user?.isOnboarded ? 'Active' : 'Pending'
                })),
                'students_export',
                [
                  { key: 'name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'registered', label: 'Registered Date' },
                  { key: 'enrolledCourses', label: 'Enrolled Courses' },
                  { key: 'status', label: 'Status' }
                ]
              )}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5EAF2',
                background: '#fff',
                color: '#111827',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </FadeInUp>

        <StaggerContainer className={styles.studentsGrid}>
          {filteredStudents.map((student) => {
            const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);
            const enrolledCoursesCount = studentEnrollments.length;
            const completedCoursesCount = studentEnrollments.filter(e => e.progress === 100).length;

            return (
              <StaggerItem key={student.id}>
                <motion.div
                  className={styles.studentCard}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={styles.studentAvatar}>{student.name.charAt(0)}</div>
                  <h3 className={styles.studentName}>{student.name}</h3>
                  <div className={styles.studentEmail}>
                    <Mail size={14} />
                    <span>{student.email}</span>
                  </div>
                  <div className={styles.studentStats}>
                    <div>
                      <BookOpen size={16} />
                      <strong>{enrolledCoursesCount}</strong>
                      <span>Enrolled</span>
                    </div>
                    <div>
                      <Award size={16} />
                      <strong>{completedCoursesCount}</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                  <div className={styles.enrolledList}>
                    {studentEnrollments.map((enrollment) => {
                      const course = courses.find((c) => c.id === enrollment.courseId);
                      return (
                        <div key={enrollment.id} className={styles.enrolledItem}>
                          <span>
                            <img src={course?.logo || 'https://via.placeholder.com/150'} alt="" style={{ width: '1em', height: '1em', objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', marginRight: '4px' }} /> {course?.title}
                          </span>
                          <div className={styles.progressBar}>
                            <motion.div
                              className={styles.progressFill}
                              initial={{ width: 0 }}
                              animate={{ width: `${enrollment.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <span className={styles.progressText}>{enrollment.progress}%</span>
                        </div>
                      );
                    })}
                    {studentEnrollments.length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        No courses enrolled yet.
                      </p>
                    )}
                    </div>

                    <div style={{ padding: '12px 14px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAssignStudent(student);
                          setAssignCourseId(courses[0]?.id || '');
                          setAssignAlert(null);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #dbeafe',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        <UserPlus size={14} />
                        <span>Assign Course</span>
                      </button>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {filteredStudents.length === 0 && (
            <FadeInUp>
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <p>{students.length === 0 ? "No students have registered yet." : "No students match your filter criteria."}</p>
              </div>
            </FadeInUp>
          )}

          {/* Student Assignment Modal */}
          <AnimatePresence>
            {assignStudent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
                onClick={() => !isAssigning && setAssignStudent(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.25)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '18px 22px',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Assign Course to Student
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        Student: <strong>{assignStudent.name}</strong> ({assignStudent.email})
                      </p>
                    </div>
                    <button
                      onClick={() => !isAssigning && setAssignStudent(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ padding: '22px' }}>
                    {assignAlert && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          marginBottom: '14px',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: assignAlert.type === 'success' ? '#f0fdf4' : '#fef2f2',
                          color: assignAlert.type === 'success' ? '#166534' : '#991b1b',
                          border: `1px solid ${assignAlert.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        }}
                      >
                        {assignAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{assignAlert.message}</span>
                      </div>
                    )}

                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Select Course to Assign:
                    </label>
                    <select
                      value={assignCourseId}
                      onChange={(e) => setAssignCourseId(e.target.value)}
                      disabled={isAssigning}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {courses.map((course) => {
                        const isEnrolled = enrollments.some(
                          (e) => e.studentId === assignStudent.id && e.courseId === course.id
                        );
                        return (
                          <option key={course.id} value={course.id}>
                            {course.title} {isEnrolled ? '(Already Enrolled)' : ''}
                          </option>
                        );
                      })}
                    </select>

                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '12px', lineHeight: 1.4 }}>
                      💡 An automated branded email will be delivered to <strong>{assignStudent.email}</strong> with immediate access instructions and dashboard link.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '14px 22px',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setAssignStudent(null)}
                      disabled={isAssigning}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAssignSubmit}
                      disabled={isAssigning || !assignCourseId}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #1d4ed8',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isAssigning ? 'Assigning...' : 'Assign & Notify'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    );
  }

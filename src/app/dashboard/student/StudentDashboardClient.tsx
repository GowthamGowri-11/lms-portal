'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, CheckCircle, Clock, Trophy, User, MessageSquare,
  Edit2, Save, X, ChevronRight, BarChart3, LogOut, Send, AlertCircle,
  CircleHelp, GraduationCap
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { formatDate } from '@/lib/utils';
import { getCourseVisual } from '@/lib/courseImages';
import styles from './student.module.css';

type EnrollmentWithCourse = {
  id: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  paymentStatus: string;
  course: {
    id: string;
    title: string;
    logo: string;
    category: string;
    level: string;
    modules: { lessons: any[] }[];
    trainer: { name: string } | null;
  };
};

type CourseProgress = {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  isCompleted: boolean;
};

type Certificate = {
  id: string;
  courseId: string;
  certificateId: string;
  issuedAt: string;
  course: { title: string };
};

type Query = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type Props = {
  student: Student;
  enrollments: EnrollmentWithCourse[];
  courseProgresses: CourseProgress[];
  certificates: Certificate[];
  queries: Query[];
  quizAttempts?: any[];
  retakeRequests?: any[];
};

const tabs = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'queries', label: 'Support', icon: MessageSquare },
];

export default function StudentDashboardClient({
  student: initialStudent,
  enrollments,
  courseProgresses,
  certificates,
  queries: initialQueries,
  quizAttempts = [],
  retakeRequests = [],
}: Props) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [student, setStudent] = useState(initialStudent);
  const [queries, setQueries] = useState(initialQueries);
  const [retakes, setRetakes] = useState<any[]>(retakeRequests);
  const [requestingQuizId, setRequestingQuizId] = useState<string | null>(null);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [saving, setSaving] = useState(false);

  // Query form
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState('');

  const completedCount = courseProgresses.filter((p) => p.isCompleted).length;
  const avgProgress = enrollments.length > 0
    ? Math.round(courseProgresses.reduce((s, p) => s + p.percentage, 0) / (enrollments.length || 1))
    : 0;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudent((s) => ({ ...s, name: data.student.name }));
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitQuery = async () => {
    if (!querySubject.trim() || !queryMessage.trim()) return;
    setSubmittingQuery(true);
    try {
      const res = await fetch('/api/student/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: querySubject, message: queryMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setQueries([data.query, ...queries]);
        setQuerySubject('');
        setQueryMessage('');
        setQuerySuccess('Your query has been submitted! Admin will respond soon.');
        setTimeout(() => setQuerySuccess(''), 4000);
      }
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleRequestRetake = async (quizId: string) => {
    setRequestingQuizId(quizId);
    try {
      const res = await fetch('/api/quizzes/retake-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (res.ok) {
        setRetakes((prev) => [data.request, ...prev]);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch {
      alert('Error submitting retake request');
    } finally {
      setRequestingQuizId(null);
    }
  };

  const getProgress = (courseId: string) => {
    return courseProgresses.find((p) => p.courseId === courseId);
  };

  const stats = [
    { label: 'Enrolled', value: enrollments.length, icon: BookOpen, color: '#6c5ce7', bg: 'rgba(108,92,231,0.15)' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: '#00b894', bg: 'rgba(0,184,148,0.15)' },
    { label: 'Avg Progress', value: `${avgProgress}%`, icon: BarChart3, color: '#fd79a8', bg: 'rgba(253,121,168,0.15)' },
    { label: 'Certificates', value: certificates.length, icon: Trophy, color: '#e17055', bg: 'rgba(225,112,85,0.15)' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon} style={{ background: 'var(--accent-primary)' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>ATLYX</span>
        </div>

        <div className={styles.sidebarProfile}>
          <div className={styles.profileAvatar}>
            {student.avatar
              ? <img src={student.avatar} alt={student.name} referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" />
              : <span>{student.name.charAt(0).toUpperCase()}</span>}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{student.name}</div>
            <div className={styles.profileRole}>Student</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && <div className={styles.navIndicator} />}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/courses" className={styles.footerLink}>
            <BookOpen size={16} /> Browse Courses
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.footerLink}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">          {/* MY COURSES TAB */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>My Courses</h1>
                <p className={styles.pageSubtitle}>{enrollments.length} enrolled course{enrollments.length !== 1 ? 's' : ''}</p>
              </div>
              <div className={styles.courseListFull}>
                {enrollments.map((e, i) => {
                  const prog = getProgress(e.courseId);
                  const pct = prog?.percentage ?? e.progress ?? 0;
                  const isComplete = prog?.isCompleted ?? false;
                  const totalLessons = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);
                  return (
                    <motion.div
                      key={e.id}
                      className={styles.courseListItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div className={styles.listItemLogo}>
                        <img
                          src={getCourseVisual(e.course.category, e.course.title, e.course.logo).imageSrc}
                          alt={e.course.title}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                      <div className={styles.listItemBody}>
                        <div className={styles.listItemTop}>
                          <h3>{e.course.title}</h3>
                          <span className={`${styles.badge} ${isComplete ? styles.badgeSuccess : styles.badgeInfo}`}>
                            {isComplete ? '✓ Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className={styles.listTrainer}>by {e.course.trainer?.name ?? 'Instructor'} · {e.course.category}</p>
                        <div className={styles.progressRow}>
                          <div className={styles.progressBar}>
                            <motion.div
                              className={styles.progressFill}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <span className={styles.progressPct}>{Math.round(pct)}%</span>
                        </div>
                        <div className={styles.listMeta}>
                          <span><Clock size={12} /> {totalLessons} lessons</span>
                          <span><CheckCircle size={12} /> {prog?.completedLessons ?? 0} done</span>
                          <span>Enrolled {formatDate(e.enrolledAt)}</span>
                        </div>
                      </div>
                      <Link href={`/courses/${e.courseId}`} className={styles.listItemAction}>
                        {isComplete ? 'Review' : 'Continue'} <ChevronRight size={16} />
                      </Link>
                    </motion.div>
                  );
                })}
                {enrollments.length === 0 && (
                  <div className={styles.emptyState}>
                    <BookOpen size={48} />
                    <h3>No courses yet</h3>
                    <p>Enroll in a course to start your learning journey</p>
                    <Link href="/courses" className={styles.browseCta}>Go to Courses</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}



          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>My Profile</h1>
                <p className={styles.pageSubtitle}>Manage your account information</p>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileCardHeader}>
                  <div className={styles.profileLargeAvatar}>
                    {student.avatar
                      ? <img src={student.avatar} alt={student.name} referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" />
                      : <span>{student.name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className={styles.profileCardInfo}>
                    <h2>{student.name}</h2>
                    <p>{student.email}</p>
                    <span className={styles.profileRoleBadge}>Student</span>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => { setEditName(student.name); setIsEditing(true); }} className={styles.editBtn}>
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleSaveProfile} disabled={saving} className={styles.saveBtn}>
                        <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.profileFields}>
                  <div className={styles.field}>
                    <label>Display Name</label>
                    {isEditing
                      ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className={styles.input} />
                      : <div className={styles.fieldValue}>{student.name}</div>}
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <div className={styles.fieldValue} style={{ opacity: 0.6 }}>{student.email} <span style={{ fontSize: '0.75rem', marginLeft: '8px' }}>(cannot be changed)</span></div>
                  </div>
                  <div className={styles.field}>
                    <label>Role</label>
                    <div className={styles.fieldValue}>Student</div>
                  </div>
                </div>

                <div className={styles.profileStats} style={{ marginBottom: '2rem' }}>
                  <div className={styles.profileStat}>
                    <strong>{enrollments.length}</strong>
                    <span>Courses Enrolled</span>
                  </div>
                  <div className={styles.profileStat}>
                    <strong>{completedCount}</strong>
                    <span>Completed</span>
                  </div>
                  <div className={styles.profileStat}>
                    <strong>{certificates.length}</strong>
                    <span>Certificates</span>
                  </div>
                  <div className={styles.profileStat}>
                    <strong>{avgProgress}%</strong>
                    <span>Avg Progress</span>
                  </div>
                </div>

                {/* Enrolled Courses Status Area in Profile */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="var(--accent-primary)" /> Enrolled Courses & Status
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {enrollments.map((e, i) => {
                      const prog = getProgress(e.courseId);
                      const pct = prog?.percentage ?? e.progress ?? 0;
                      const isComplete = prog?.isCompleted ?? false;
                      const totalLessons = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);

                      return (
                        <div key={e.id} style={{ 
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
                          borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap'
                        }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {e.course.logo ? <img src={e.course.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" /> : <BookOpen size={24} />}
                          </div>
                          
                          <div style={{ flex: '1 1 200px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{e.course.level}</div>
                            <h4 style={{ fontSize: '1.1rem', margin: '4px 0', color: 'var(--text-primary)' }}>{e.course.title}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>by {e.course.trainer?.name}</div>
                          </div>

                          <div style={{ flex: '1 1 150px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                               <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                               <span style={{ fontWeight: 600, color: isComplete ? '#34d399' : '#60a5fa' }}>{isComplete ? 'Completed' : 'In Progress'}</span>
                             </div>
                             <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                               <div style={{ height: '100%', width: `${pct}%`, background: isComplete ? '#34d399' : '#60a5fa', borderRadius: '3px' }} />
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-tertiary)' }}>
                               <span>{prog?.completedLessons ?? 0} / {totalLessons} lessons</span>
                               <span>{Math.round(pct)}%</span>
                             </div>
                          </div>

                          <div style={{ flexShrink: 0 }}>
                            <Link href={`/courses/${e.courseId}`} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', 
                              borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', 
                              fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none'
                            }}>
                              {isComplete ? 'Review' : 'Continue'} <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                    
                    {enrollments.length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: 'var(--text-tertiary)' }}>
                        <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>You haven't enrolled in any courses yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUPPORT/QUERIES TAB */}
          {activeTab === 'queries' && (
            <motion.div key="queries" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Support Center</h1>
                <p className={styles.pageSubtitle}>Ask questions, get help from our team</p>
              </div>

              {/* New Query Form */}
              <div className={styles.queryForm}>
                <h3>Submit a Query</h3>
                {querySuccess && (
                  <div className={styles.successAlert}>
                    <CheckCircle size={16} /> {querySuccess}
                  </div>
                )}
                <div className={styles.field}>
                  <label>Subject</label>
                  <input
                    value={querySubject}
                    onChange={(e) => setQuerySubject(e.target.value)}
                    placeholder="e.g. Issue with Python Module 3"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>Message</label>
                  <textarea
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className={styles.textarea}
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleSubmitQuery}
                  disabled={submittingQuery || !querySubject || !queryMessage}
                  className={styles.submitQueryBtn}
                >
                  <Send size={16} /> {submittingQuery ? 'Sending...' : 'Send Query'}
                </button>
              </div>

              {/* Query History */}
              <div className={styles.section}>
                <h2 style={{ marginBottom: '1rem' }}>Query History</h2>
                <div className={styles.queryList}>
                  {queries.map((q, i) => (
                    <motion.div
                      key={q.id}
                      className={styles.queryItem}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div className={styles.queryItemHeader}>
                        <strong>{q.subject}</strong>
                        <span className={`${styles.badge} ${q.status === 'RESOLVED' ? styles.badgeSuccess : q.status === 'IN_PROGRESS' ? styles.badgeWarning : styles.badgeInfo}`}>
                          {q.status}
                        </span>
                      </div>
                      <p className={styles.queryMsg}>{q.message}</p>
                      {q.adminReply && (
                        <div className={styles.adminReply}>
                          <strong>Admin Reply:</strong> {q.adminReply}
                        </div>
                      )}
                      <div className={styles.queryDate}>{formatDate(q.createdAt)}</div>
                    </motion.div>
                  ))}
                  {queries.length === 0 && (
                    <div className={styles.emptyState}>
                      <MessageSquare size={40} />
                      <p>No queries yet. Submit your first query above!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

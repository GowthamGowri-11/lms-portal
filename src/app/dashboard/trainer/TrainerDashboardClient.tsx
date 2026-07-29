'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Users, BarChart3, Settings, LogOut,
  ChevronRight, Edit2, Save, X, Eye, EyeOff,
  Layers, FileText, Clock, CheckCircle,
  HelpCircle, Plus, Trash2, Edit3, ChevronDown, RotateCcw, Check, XCircle as XCircleIcon, GraduationCap
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from './trainer.module.css';

type Lesson = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  notes: string;
  duration: string;
  isFree: boolean;
  order: number;
};

type Module = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  logo: string;
  category: string;
  level: string;
  duration: string;
  tags: string[];
  isPublished: boolean;
  modules: Module[];
  enrollments: any[];
};

type Trainer = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialization: string;
  bio: string;
  experience: string;
  rating: number;
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'editor', label: 'Course Editor', icon: Edit2 },
  { id: 'quizzes', label: 'Set Course Quizzes', icon: HelpCircle },
  { id: 'retakes', label: 'Retake Requests', icon: RotateCcw },
];

export default function TrainerDashboardClient({
  trainer: initialTrainer,
  courses: initialCourses,
  retakeRequests: initialRetakes = [],
}: {
  trainer: Trainer;
  courses: Course[];
  retakeRequests?: any[];
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [trainer, setTrainer] = useState(initialTrainer);
  const [courses, setCourses] = useState(initialCourses);
  const [retakes, setRetakes] = useState<any[]>(initialRetakes);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    initialCourses.length > 0 ? initialCourses[0].id : null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Quiz editor state
  const [selectedQuizCourseId, setSelectedQuizCourseId] = useState<string>(
    initialCourses.length > 0 ? initialCourses[0].id : ''
  );
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: '',
    moduleId: '',
    afterLessonId: '',
    isFinalAssessment: false,
    timeLimit: 15,
    passMark: 70,
  });
  const emptyQ = { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', explanation: '', order: 0 };
  const [numQuizQuestions, setNumQuizQuestions] = useState(1);
  const [quizQuestions, setQuizQuestions] = useState<typeof emptyQ[]>([{ ...emptyQ }]);
  const [isQuizSaving, setIsQuizSaving] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const openCreateQuiz = (courseId: string) => {
    setEditingQuiz(null);
    setQuizForm({ title: '', description: '', courseId, moduleId: '', afterLessonId: '', isFinalAssessment: false, timeLimit: 15, passMark: 70 });
    setNumQuizQuestions(1);
    setQuizQuestions([{ ...emptyQ }]);
    setShowQuizModal(true);
  };

  const openEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      courseId: quiz.courseId || selectedQuizCourseId,
      moduleId: quiz.moduleId || '',
      afterLessonId: quiz.afterLessonId || '',
      isFinalAssessment: Boolean(quiz.isFinalAssessment),
      timeLimit: quiz.timeLimit || 0,
      passMark: quiz.passMark || 70,
    });
    const parsedQuestions = (quiz.questions || []).map((q: any) => ({
      question: q.question,
      type: q.type || 'mcq',
      options: (() => { try { return typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch { return ['', '', '', '']; } })(),
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      order: q.order || 0,
    }));
    setQuizQuestions(parsedQuestions.length > 0 ? parsedQuestions : [{ ...emptyQ }]);
    setNumQuizQuestions(parsedQuestions.length > 0 ? parsedQuestions.length : 1);
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuizSaving(true);
    try {
      const payload = {
        ...quizForm,
        courseId: selectedQuizCourseId,
        questions: quizQuestions.map((q, i) => ({
          ...q,
          options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options.filter(Boolean)),
          order: i,
        })),
        ...(editingQuiz ? { id: editingQuiz.id } : {}),
      };
      const res = await fetch('/api/trainer/quizzes', {
        method: editingQuiz ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save quiz');
      setShowQuizModal(false);
      window.location.reload();
    } catch (err) {
      alert('Error saving quiz. Please check all fields.');
    } finally {
      setIsQuizSaving(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return;
    try {
      await fetch('/api/trainer/quizzes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      window.location.reload();
    } catch {
      alert('Error deleting quiz');
    }
  };

  const handleResolveRetake = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/quizzes/retake-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setRetakes((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to resolve request');
      }
    } catch {
      alert('Error resolving request');
    }
  };

  // First-time onboarding state (when specialization is General and bio/experience are empty)
  const [showOnboarding, setShowOnboarding] = useState(
    initialTrainer.specialization === 'General' &&
    initialTrainer.bio === '' &&
    initialTrainer.experience === ''
  );
  const [onboardingForm, setOnboardingForm] = useState({
    name: initialTrainer.name,
    specialization: '',
    experience: '',
    bio: '',
    avatar: initialTrainer.avatar,
  });
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);

  // Course editing state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [savingCourse, setSavingCourse] = useState(false);

  // Lesson editing state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboardingSaving(true);
    try {
      const res = await fetch('/api/trainer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingForm),
      });
      if (res.ok) {
        const data = await res.json();
        setTrainer(data.trainer);
        setShowOnboarding(false);
      } else {
        alert('Failed to save profile details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating trainer profile.');
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const selectedLesson = selectedCourse?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === selectedLessonId) || null;

  const totalStudents = courses.reduce((s, c) => s + c.enrollments.length, 0);
  const totalLessons = courses.reduce((s, c) =>
    s + c.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0);

  const stats = [
    { label: 'My Courses', value: courses.length, icon: BookOpen, color: '#6c5ce7', bg: 'rgba(108,92,231,0.15)' },
    { label: 'Total Students', value: totalStudents, icon: Users, color: '#00b894', bg: 'rgba(0,184,148,0.15)' },
    { label: 'Total Lessons', value: totalLessons, icon: Layers, color: '#fd79a8', bg: 'rgba(253,121,168,0.15)' },
    { label: 'Published', value: courses.filter((c) => c.isPublished).length, icon: CheckCircle, color: '#e17055', bg: 'rgba(225,112,85,0.15)' },
  ];

  const handleSaveCourse = async () => {
    if (!editingCourse) return;
    setSavingCourse(true);
    try {
      const res = await fetch(`/api/trainer/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingCourse.title,
          description: editingCourse.description,
          shortDescription: editingCourse.shortDescription,
          category: editingCourse.category,
          level: editingCourse.level,
          duration: editingCourse.duration,
          isPublished: editingCourse.isPublished,
          tags: editingCourse.tags,
        }),
      });
      if (res.ok) {
        setCourses(courses.map((c) => c.id === editingCourse.id ? { ...c, ...editingCourse } : c));
        setEditingCourse(null);
      }
    } finally {
      setSavingCourse(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    setSavingLesson(true);
    try {
      const res = await fetch(`/api/trainer/lessons/${editingLesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingLesson.title,
          description: editingLesson.description,
          videoUrl: editingLesson.videoUrl,
          notes: editingLesson.notes,
          duration: editingLesson.duration,
          isFree: editingLesson.isFree,
        }),
      });
      if (res.ok) {
        setCourses(courses.map((c) => ({
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === editingLesson.id ? { ...l, ...editingLesson } : l
            ),
          })),
        })));
        setEditingLesson(null);
      }
    } finally {
      setSavingLesson(false);
    }
  };

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
            {trainer.avatar
              ? <img src={trainer.avatar} alt={trainer.name} referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" />
              : <span>{trainer.name.charAt(0).toUpperCase()}</span>}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{trainer.name}</div>
            <div className={styles.profileRole}>Trainer</div>
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
            <Eye size={16} /> View Site
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.footerLink}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Trainer Dashboard</h1>
                <p className={styles.pageSubtitle}>Welcome back, {trainer.name.split(' ')[0]}! Here's your summary.</p>
              </div>

              <div className={styles.statsGrid}>
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={i} className={styles.statCard}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                      <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
                        <Icon size={22} />
                      </div>
                      <div className={styles.statValue}>{s.value}</div>
                      <div className={styles.statLabel}>{s.label}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className={styles.section}>
                <h2>My Assigned Courses</h2>
                <div className={styles.courseGrid}>
                  {courses.map((c, i) => (
                    <motion.div key={c.id} className={styles.courseCard}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                      <div className={styles.courseCardTop}>
                        <div className={styles.courseLogo}>
                          {c.logo ? <img src={c.logo} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" /> : <BookOpen size={24} />}
                        </div>
                        <span className={`${styles.badge} ${c.isPublished ? styles.badgeSuccess : styles.badgeWarning}`}>
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <h3 className={styles.courseTitle}>{c.title}</h3>
                      <p className={styles.courseMeta}>{c.category} · {c.level}</p>
                      <div className={styles.courseStats}>
                        <span><Users size={12} /> {c.enrollments.length} students</span>
                        <span><Layers size={12} /> {c.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
                      </div>
                      <button
                        className={styles.editCourseBtn}
                        onClick={() => { setSelectedCourseId(c.id); setActiveTab('editor'); }}
                      >
                        <Edit2 size={14} /> Edit Course
                      </button>
                    </motion.div>
                  ))}
                  {courses.length === 0 && (
                    <div className={styles.emptyState}>
                      <BookOpen size={40} />
                      <p>No courses assigned yet. Contact admin to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* COURSES LIST */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>My Courses</h1>
                <p className={styles.pageSubtitle}>{courses.length} course{courses.length !== 1 ? 's' : ''} assigned to you</p>
              </div>
              <div className={styles.courseListFull}>
                {courses.map((c, i) => (
                  <motion.div key={c.id} className={styles.courseListItem}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}>
                    <div className={styles.listLogo}>
                      {c.logo ? <img src={c.logo} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" /> : <BookOpen size={24} />}
                    </div>
                    <div className={styles.listBody}>
                      <div className={styles.listTop}>
                        <h3>{c.title}</h3>
                        <span className={`${styles.badge} ${c.isPublished ? styles.badgeSuccess : styles.badgeWarning}`}>
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className={styles.listMeta}>{c.category} · {c.level}</p>
                      <div className={styles.listStats}>
                        <span><Users size={12} /> {c.enrollments.length} students enrolled</span>
                        <span><Layers size={12} /> {c.modules.length} modules</span>
                        <span><FileText size={12} /> {c.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
                      </div>
                    </div>
                    <button
                      className={styles.listEditBtn}
                      onClick={() => { setSelectedCourseId(c.id); setActiveTab('editor'); }}
                    >
                      <Edit2 size={14} /> Edit <ChevronRight size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* COURSE EDITOR */}
          {activeTab === 'editor' && (
            <motion.div key="editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Course Editor</h1>
                <p className={styles.pageSubtitle}>Edit course details, modules, and lessons</p>
              </div>

              <div className={styles.editorLayout}>
                {/* Course selector */}
                <div className={styles.editorSidebar}>
                  <div className={styles.editorSidebarTitle}>Courses</div>
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      className={`${styles.editorCourseBtn} ${selectedCourseId === c.id ? styles.editorCourseBtnActive : ''}`}
                      onClick={() => { setSelectedCourseId(c.id); setSelectedLessonId(null); setEditingLesson(null); setEditingCourse(null); }}
                    >
                      <BookOpen size={14} />
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>

                {/* Editor content */}
                <div className={styles.editorMain}>
                  {selectedCourse ? (
                    <>
                      {/* Course Info Editor */}
                      <div className={styles.editorSection}>
                        <div className={styles.editorSectionHeader}>
                          <h3>Course Information</h3>
                          {editingCourse ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={handleSaveCourse} disabled={savingCourse} className={styles.saveBtn}>
                                <Save size={14} /> {savingCourse ? 'Saving...' : 'Save'}
                              </button>
                              <button onClick={() => setEditingCourse(null)} className={styles.cancelBtn}>
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setEditingCourse({ ...selectedCourse })} className={styles.editBtn}>
                              <Edit2 size={14} /> Edit
                            </button>
                          )}
                        </div>

                        <div className={styles.fieldGrid}>
                          <div className={styles.field}>
                            <label>Title</label>
                            {editingCourse ? (
                              <input className={styles.input} value={editingCourse.title}
                                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                            ) : <div className={styles.fieldValue}>{selectedCourse.title}</div>}
                          </div>
                          <div className={styles.field}>
                            <label>Category</label>
                            {editingCourse ? (
                              <input className={styles.input} value={editingCourse.category}
                                onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })} />
                            ) : <div className={styles.fieldValue}>{selectedCourse.category}</div>}
                          </div>
                          <div className={styles.field}>
                            <label>Level</label>
                            {editingCourse ? (
                              <select className={styles.input} value={editingCourse.level}
                                onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}>
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                              </select>
                            ) : <div className={styles.fieldValue}>{selectedCourse.level}</div>}
                          </div>
                          <div className={styles.field}>
                            <label>Duration</label>
                            {editingCourse ? (
                              <input className={styles.input} value={editingCourse.duration}
                                onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })} />
                            ) : <div className={styles.fieldValue}>{selectedCourse.duration}</div>}
                          </div>
                          <div className={`${styles.field} ${styles.fieldFull}`}>
                            <label>Short Description</label>
                            {editingCourse ? (
                              <textarea className={styles.textarea} rows={2} value={editingCourse.shortDescription}
                                onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })} />
                            ) : <div className={styles.fieldValue}>{selectedCourse.shortDescription || 'Not set'}</div>}
                          </div>
                          <div className={`${styles.field} ${styles.fieldFull}`}>
                            <label>Full Description</label>
                            {editingCourse ? (
                              <textarea className={styles.textarea} rows={4} value={editingCourse.description}
                                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} />
                            ) : <div className={styles.fieldValue}>{selectedCourse.description || 'Not set'}</div>}
                          </div>
                          {editingCourse && (
                            <div className={styles.field}>
                              <label>Published</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                                <button
                                  onClick={() => setEditingCourse({ ...editingCourse, isPublished: !editingCourse.isPublished })}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '8px',
                                    background: editingCourse.isPublished ? 'rgba(0,184,148,0.15)' : 'rgba(108,92,231,0.1)',
                                    color: editingCourse.isPublished ? '#00b894' : 'var(--text-secondary)',
                                    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                  }}>
                                  {editingCourse.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                  {editingCourse.isPublished ? 'Published' : 'Draft'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lessons Editor */}
                      <div className={styles.editorSection}>
                        <h3 style={{ marginBottom: '16px' }}>Modules & Lessons</h3>
                        {selectedCourse.modules.map((mod) => (
                          <div key={mod.id} className={styles.moduleBlock}>
                            <div className={styles.moduleTitle}>
                              <Layers size={16} />
                              Module {mod.order}: {mod.title}
                            </div>
                            <div className={styles.lessonList}>
                              {mod.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className={`${styles.lessonItem} ${selectedLessonId === lesson.id ? styles.lessonItemActive : ''}`}
                                  onClick={() => {
                                    setSelectedLessonId(lesson.id);
                                    setEditingLesson(null);
                                  }}
                                >
                                  <FileText size={14} />
                                  <span>{lesson.title || 'Untitled Lesson'}</span>
                                  {lesson.isFree && <span className={styles.freeTag}>Free</span>}
                                </div>
                              ))}
                              {mod.lessons.length === 0 && (
                                <div className={styles.emptyModuleNote}>No lessons in this module</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Lesson Detail Editor */}
                      {selectedLesson && (
                        <div className={styles.editorSection}>
                          <div className={styles.editorSectionHeader}>
                            <h3>Lesson Editor</h3>
                            {editingLesson ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleSaveLesson} disabled={savingLesson} className={styles.saveBtn}>
                                  <Save size={14} /> {savingLesson ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditingLesson(null)} className={styles.cancelBtn}>
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingLesson({ ...selectedLesson })} className={styles.editBtn}>
                                <Edit2 size={14} /> Edit Lesson
                              </button>
                            )}
                          </div>

                          <div className={styles.fieldGrid}>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label>Lesson Title</label>
                              {editingLesson
                                ? <input className={styles.input} value={editingLesson.title}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })} />
                                : <div className={styles.fieldValue}>{selectedLesson.title}</div>}
                            </div>
                            <div className={styles.field}>
                              <label>Duration</label>
                              {editingLesson
                                ? <input className={styles.input} value={editingLesson.duration}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })} />
                                : <div className={styles.fieldValue}>{selectedLesson.duration || 'Not set'}</div>}
                            </div>
                            <div className={styles.field}>
                              <label>Video URL</label>
                              {editingLesson
                                ? <input className={styles.input} value={editingLesson.videoUrl}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                                    placeholder="https://..." />
                                : <div className={styles.fieldValue}>{selectedLesson.videoUrl || 'Not set'}</div>}
                            </div>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label>Description</label>
                              {editingLesson
                                ? <textarea className={styles.textarea} rows={3} value={editingLesson.description}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })} />
                                : <div className={styles.fieldValue}>{selectedLesson.description || 'Not set'}</div>}
                            </div>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label>Notes / Content</label>
                              {editingLesson
                                ? <textarea className={styles.textarea} rows={6} value={editingLesson.notes}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, notes: e.target.value })} />
                                : <div className={styles.fieldValue}>{selectedLesson.notes || 'No notes added'}</div>}
                            </div>
                            {editingLesson && (
                              <div className={styles.field}>
                                <label>Free Preview</label>
                                <button
                                  onClick={() => setEditingLesson({ ...editingLesson, isFree: !editingLesson.isFree })}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '6px 14px', borderRadius: '8px', marginTop: '6px',
                                    background: editingLesson.isFree ? 'rgba(0,184,148,0.15)' : 'rgba(108,92,231,0.1)',
                                    color: editingLesson.isFree ? '#00b894' : 'var(--text-secondary)',
                                    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                  }}>
                                  {editingLesson.isFree ? '✓ Free Preview' : 'Mark as Free'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <BookOpen size={48} />
                      <p>Select a course from the sidebar to start editing</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <motion.div key="quizzes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Set Course Quizzes</h1>
                <p className={styles.pageSubtitle}>Add, edit, or rewrite quizzes for your assigned courses, and configure their exact lesson placement order.</p>
              </div>

              {courses.length === 0 ? (
                <div className={styles.emptyState}>
                  <BookOpen size={48} />
                  <p>No courses assigned to you yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedQuizCourseId(c.id)}
                        style={{
                          padding: '10px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid var(--glass-border)', cursor: 'pointer',
                          background: selectedQuizCourseId === c.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                          color: selectedQuizCourseId === c.id ? '#fff' : 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        }}
                      >
                        <HelpCircle size={16} />
                        {c.title} ({(c as any).quizzes?.length || 0})
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const selectedCourse = courses.find((c) => c.id === selectedQuizCourseId);
                    const courseQuizzes: any[] = (selectedCourse as any)?.quizzes || [];

                    return (
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quizzes for {selectedCourse?.title}</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Passing all quizzes in a course is mandatory for students to complete the course.</p>
                          </div>
                          <button
                            onClick={() => openCreateQuiz(selectedQuizCourseId)}
                            className={styles.addBtn}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <Plus size={16} /> Add Quiz Test
                          </button>
                        </div>

                        {courseQuizzes.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                            <HelpCircle size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ fontWeight: 600 }}>No quizzes added to this course yet.</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "Add Quiz Test" to create questions and set lesson placement.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {courseQuizzes.map((q) => {
                              let placementText = 'Final Assessment (End of Course)';
                              if (!q.isFinalAssessment) {
                                if (q.afterLessonId) {
                                  let lesTitle = '';
                                  selectedCourse?.modules?.forEach((m) => {
                                    m.lessons?.forEach((l) => {
                                      if (l.id === q.afterLessonId) lesTitle = l.title;
                                    });
                                  });
                                  placementText = lesTitle ? `After Lesson: "${lesTitle}"` : 'Custom Lesson Placement';
                                } else if (q.moduleId) {
                                  const modTitle = selectedCourse?.modules?.find((m) => m.id === q.moduleId)?.title;
                                  placementText = modTitle ? `At Module End: "${modTitle}"` : 'Module Quiz';
                                }
                              }

                              return (
                                <div key={q.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                  <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{q.title}</span>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                                          {placementText}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                                        <span>Questions: {q.questions?.length || 0}</span>
                                        <span>Pass Mark: {q.passMark}%</span>
                                        {q.timeLimit > 0 && <span>Time Limit: {q.timeLimit} mins</span>}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={() => setExpandedQuizId(expandedQuizId === q.id ? null : q.id)}
                                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        <Eye size={14} /> {expandedQuizId === q.id ? 'Hide Qs' : 'View Qs'}
                                      </button>
                                      <button
                                        onClick={() => openEditQuiz(q)}
                                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                      >
                                        <Edit3 size={14} /> Edit & Rewrite
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuiz(q.id)}
                                        style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', cursor: 'pointer' }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {expandedQuizId === q.id && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Questions & Options:</h4>
                                      {(q.questions || []).length === 0 ? (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No questions added yet.</p>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          {q.questions.map((qn: any, idx: number) => {
                                            const opts = (() => { try { return typeof qn.options === 'string' ? JSON.parse(qn.options) : qn.options; } catch { return []; } })();
                                            return (
                                              <div key={qn.id || idx} style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                <div style={{ fontWeight: 600 }}>Q{idx + 1}. {qn.question}</div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                                  {opts.map((opt: string, oIdx: number) => (
                                                    <span key={oIdx} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: opt === qn.correctAnswer ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)', color: opt === qn.correctAnswer ? '#34d399' : 'var(--text-secondary)' }}>
                                                      {opt} {opt === qn.correctAnswer && '✓'}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </motion.div>
          )}

          {/* RETAKE REQUESTS */}
          {activeTab === 'retakes' && (
            <motion.div key="retakes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quiz Retake Requests</h1>
                <p className={styles.pageSubtitle}>Review and approve student requests to retake course quizzes.</p>
              </div>

              {retakes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16 }}>
                  <CheckCircle size={48} style={{ color: 'var(--accent-success)', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>All Caught Up!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending retake requests for your assigned courses.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {retakes.map((req) => (
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                          {req.student?.avatar ? <img src={req.student.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy" /> : (req.student?.name?.[0] || 'S')}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>{req.student?.name}</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Requested to retake <strong style={{ color: 'var(--text-primary)' }}>{req.quiz?.title}</strong> in <em>{req.quiz?.course?.title}</em>
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Requested on {new Date(req.requestedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleResolveRetake(req.id, 'REJECTED')}
                          style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <XCircleIcon size={16} /> Reject
                        </button>
                        <button
                          onClick={() => handleResolveRetake(req.id, 'APPROVED')}
                          style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--accent-success)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                        >
                          <Check size={16} /> Approve Retake
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuizModal && (
          <motion.div
            className={styles.modalOverlay}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isQuizSaving && setShowQuizModal(false)}
          >
            <motion.div
              style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingQuiz ? 'Edit & Rewrite Quiz' : 'Create Course Quiz'}</h3>
                <button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Quiz Title *</label>
                      <input type="text" className="input-field" style={{ width: '100%' }} value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required placeholder="e.g. Module 1 Checkpoint or Course Final Test" />
                    </div>

                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Where to place this quiz in the course curriculum *</label>
                      <select
                        className="input-field"
                        style={{ width: '100%' }}
                        value={quizForm.isFinalAssessment ? 'FINAL' : quizForm.afterLessonId ? `LESSON_${quizForm.afterLessonId}` : quizForm.moduleId ? `MOD_${quizForm.moduleId}` : 'FINAL'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'FINAL') {
                            setQuizForm({ ...quizForm, isFinalAssessment: true, afterLessonId: '', moduleId: '' });
                          } else if (val.startsWith('LESSON_')) {
                            const lesId = val.replace('LESSON_', '');
                            const selectedCourse = courses.find((c) => c.id === selectedQuizCourseId);
                            let modId = '';
                            selectedCourse?.modules?.forEach((m) => {
                              if (m.lessons?.some((l) => l.id === lesId)) modId = m.id;
                            });
                            setQuizForm({ ...quizForm, isFinalAssessment: false, afterLessonId: lesId, moduleId: modId });
                          } else if (val.startsWith('MOD_')) {
                            setQuizForm({ ...quizForm, isFinalAssessment: false, afterLessonId: '', moduleId: val.replace('MOD_', '') });
                          }
                        }}
                      >
                        <option value="FINAL">At the end of the course (Final Assessment)</option>
                        {courses.find((c) => c.id === selectedQuizCourseId)?.modules?.map((m, mIdx) => (
                          <optgroup key={m.id} label={`Module ${mIdx + 1}: ${m.title}`}>
                            <option value={`MOD_${m.id}`}>At Module end (General Module Quiz)</option>
                            {m.lessons?.map((les, lIdx) => (
                              <option key={les.id} value={`LESSON_${les.id}`}>After Lesson {lIdx + 1}: {les.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Time Limit (minutes) *</label>
                      <input type="number" className="input-field" style={{ width: '100%' }} value={quizForm.timeLimit} min={1} required onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Math.max(1, Number(e.target.value)) })} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>Quiz will auto-close when timer expires</span>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Pass Mark (%)</label>
                      <input type="number" className="input-field" style={{ width: '100%' }} value={quizForm.passMark} min={0} max={100} onChange={(e) => setQuizForm({ ...quizForm, passMark: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                    <div className="input-group" style={{ flex: '0 0 180px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>No. of Questions *</label>
                      <input type="number" className="input-field" style={{ width: '100%' }} value={numQuizQuestions} min={1} required onChange={(e) => setNumQuizQuestions(Math.max(1, Number(e.target.value)))} />
                    </div>
                    <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }} onClick={() => {
                      const n = numQuizQuestions;
                      if (n < quizQuestions.length) {
                        setQuizQuestions(quizQuestions.slice(0, n));
                      } else {
                        const extras = Array.from({ length: n - quizQuestions.length }, (_, i) => ({ ...emptyQ, order: quizQuestions.length + i }));
                        setQuizQuestions([...quizQuestions, ...extras]);
                      }
                    }}>
                      <Plus size={14} /> Generate {numQuizQuestions} Placeholder{numQuizQuestions > 1 ? 's' : ''}
                    </button>
                  </div>

                  {/* Questions List */}
                  <div style={{ paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Questions ({quizQuestions.length})</h4>
                      <button
                        type="button"
                        onClick={() => setQuizQuestions([...quizQuestions, { ...emptyQ, order: quizQuestions.length }])}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        <Plus size={14} /> Add Question
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {quizQuestions.map((q, qIdx) => (
                        <div key={qIdx} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Question #{qIdx + 1}</span>
                            {quizQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setQuizQuestions(quizQuestions.filter((_, idx) => idx !== qIdx))}
                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ width: '100%' }}
                              placeholder="Enter your question text here..."
                              value={q.question}
                              onChange={(e) => setQuizQuestions(quizQuestions.map((qn, i) => i === qIdx ? { ...qn, question: e.target.value } : qn))}
                              required
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Options & Correct Answer (click circle to set correct):</label>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="radio"
                                  name={`correct_${qIdx}`}
                                  checked={opt !== '' && opt === q.correctAnswer}
                                  onChange={() => setQuizQuestions(quizQuestions.map((qn, i) => i === qIdx ? { ...qn, correctAnswer: opt } : qn))}
                                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <input
                                  type="text"
                                  className="input-field"
                                  style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                                  placeholder={`Option ${oIdx + 1}`}
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuizQuestions(quizQuestions.map((qn, i) => {
                                      if (i !== qIdx) return qn;
                                      const newOpts = [...qn.options];
                                      newOpts[oIdx] = val;
                                      return { ...qn, options: newOpts, correctAnswer: qn.correctAnswer === opt ? val : qn.correctAnswer };
                                    }));
                                  }}
                                  required={oIdx < 2}
                                />
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '10px' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ width: '100%', fontSize: '0.8rem' }}
                              placeholder="Explanation for correct answer (optional)"
                              value={q.explanation}
                              onChange={(e) => setQuizQuestions(quizQuestions.map((qn, i) => i === qIdx ? { ...qn, explanation: e.target.value } : qn))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--bg-secondary)' }}>
                  <button type="button" onClick={() => setShowQuizModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isQuizSaving} style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {isQuizSaving ? 'Saving Quiz...' : 'Save & Publish Quiz'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ zIndex: 9999 }} // Make sure it overlays everything
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="modal-header">
                <h2>Complete Your Profile Setup</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Welcome to ATLYX! As an approved trainer, please complete your profile details before accessing the dashboard.
              </p>

              <form onSubmit={handleOnboardingSubmit} className={styles.form}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%' }}
                      value={onboardingForm.name}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, name: e.target.value })}
                      required
                      disabled={isOnboardingSaving}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>Specialization *</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="e.g. Full Stack Web Development, Python Programming"
                      value={onboardingForm.specialization}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, specialization: e.target.value })}
                      required
                      disabled={isOnboardingSaving}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>Experience (e.g. 5+ years) *</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="e.g. 8 years"
                      value={onboardingForm.experience}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, experience: e.target.value })}
                      required
                      disabled={isOnboardingSaving}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>Avatar URL (optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="https://..."
                      value={onboardingForm.avatar}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, avatar: e.target.value })}
                      disabled={isOnboardingSaving}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-secondary)' }}>Bio / Professional Summary *</label>
                    <textarea
                      className="input-field textarea-field"
                      style={{ width: '100%', minHeight: '80px' }}
                      placeholder="Share your professional background and expertise..."
                      value={onboardingForm.bio}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, bio: e.target.value })}
                      required
                      disabled={isOnboardingSaving}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ background: '#e17055', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    disabled={isOnboardingSaving}
                  >
                    {isOnboardingSaving ? 'Saving Profile...' : 'Save & Enter Dashboard'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  Search,
  PlusCircle,
  Layers,
  Award,
  Clock,
  CheckCircle2,
  Check,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { PageTransition } from '@/components/animations/MotionWrappers';
import { Quiz, QuizQuestion, Course, Module } from '@/generated/prisma/client';
import { getCourseVisual } from '@/lib/courseImages';
import styles from './quizzes.module.css';

type QuizWithData = Quiz & {
  questions: QuizQuestion[];
  course: Pick<Course, 'id' | 'title' | 'logo' | 'category'> | null;
  module: Pick<Module, 'id' | 'title'> | null;
  afterLessonId?: string | null;
  isFinalAssessment?: boolean;
};

const emptyQ = {
  question: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  order: 0,
};

export default function AdminQuizzesClient({
  quizzes,
  courses,
  modules,
}: {
  quizzes: QuizWithData[];
  courses: (Pick<Course, 'id' | 'title' | 'logo' | 'category'> & {
    modules?: { id: string; title: string; lessons?: { id: string; title: string }[] }[];
  })[];
  modules: Pick<Module, 'id' | 'title' | 'courseId'>[];
}) {
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'FINAL' | 'MODULE'>('ALL');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithData | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: '',
    moduleId: '',
    afterLessonId: '',
    isFinalAssessment: false,
    timeLimit: 10,
    passMark: 70,
  });
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState<typeof emptyQ[]>([{ ...emptyQ }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showQuizModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showQuizModal]);

  // Deduplicate courses for the filter dropdown
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    quizzes.forEach((q) => {
      if (q.course) {
        const item = map.get(q.course.id);
        if (item) {
          item.count += 1;
        } else {
          map.set(q.course.id, { id: q.course.id, title: q.course.title, count: 1 });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [quizzes]);

  // Overall Statistics
  const totalQuizzes = quizzes.length;
  const totalQuestions = useMemo(
    () => quizzes.reduce((acc, q) => acc + q.questions.length, 0),
    [quizzes]
  );
  const finalAssessmentsCount = useMemo(
    () => quizzes.filter((q) => q.isFinalAssessment).length,
    [quizzes]
  );
  const moduleQuizzesCount = useMemo(
    () => quizzes.filter((q) => !q.isFinalAssessment).length,
    [quizzes]
  );
  const avgPassMark = useMemo(() => {
    if (!quizzes.length) return 70;
    const sum = quizzes.reduce((acc, q) => acc + (q.passMark || 70), 0);
    return Math.round(sum / quizzes.length);
  }, [quizzes]);

  const toggle = (id: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesCourse =
        selectedCourseFilter === 'ALL' || q.courseId === selectedCourseFilter;
      const matchesType =
        selectedTypeFilter === 'ALL' ||
        (selectedTypeFilter === 'FINAL' && q.isFinalAssessment) ||
        (selectedTypeFilter === 'MODULE' && !q.isFinalAssessment);
      const query = search.toLowerCase();
      const matchesSearch =
        q.title.toLowerCase().includes(query) ||
        (q.course?.title && q.course.title.toLowerCase().includes(query));
      return matchesCourse && matchesType && matchesSearch;
    });
  }, [quizzes, selectedCourseFilter, selectedTypeFilter, search]);

  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: '',
      description: '',
      courseId: selectedCourseFilter === 'ALL' ? '' : selectedCourseFilter,
      moduleId: '',
      afterLessonId: '',
      isFinalAssessment: false,
      timeLimit: 10,
      passMark: 70,
    });
    setNumQuestions(1);
    setQuestions([{ ...emptyQ }]);
    setShowQuizModal(true);
  };

  const openEditQuiz = (quiz: QuizWithData) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId ?? '',
      moduleId: quiz.moduleId ?? '',
      afterLessonId: quiz.afterLessonId ?? '',
      isFinalAssessment: Boolean(quiz.isFinalAssessment),
      timeLimit: quiz.timeLimit,
      passMark: quiz.passMark,
    });
    setQuestions(
      quiz.questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: (() => {
          try {
            return JSON.parse(q.options);
          } catch {
            return ['', '', '', ''];
          }
        })(),
        correctAnswer: (() => {
          try {
            return typeof q.correctAnswer === 'string'
              ? q.correctAnswer
              : JSON.stringify(q.correctAnswer);
          } catch {
            return '';
          }
        })(),
        explanation: q.explanation,
        order: q.order,
      }))
    );
    setNumQuestions(quiz.questions.length || 1);
    setShowQuizModal(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...quizForm,
        questions: questions.map((q, i) => ({
          ...q,
          options: JSON.stringify(
            q.type === 'truefalse' ? ['True', 'False'] : q.options.filter(Boolean)
          ),
          order: i,
        })),
        ...(editingQuiz ? { id: editingQuiz.id } : {}),
      };
      await fetch('/api/admin/quizzes', {
        method: editingQuiz ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowQuizModal(false);
      window.location.reload();
    } catch {
      alert('Error saving quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz and all its questions?')) return;
    await fetch('/api/admin/quizzes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  };

  const addQuestion = () => setQuestions((p) => [...p, { ...emptyQ, order: p.length }]);
  const removeQuestion = (i: number) => setQuestions((p) => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: string, val: unknown) =>
    setQuestions((p) => p.map((q, idx) => (idx === i ? { ...q, [field]: val } : q)));
  const updateOption = (qi: number, oi: number, val: string) =>
    setQuestions((p) =>
      p.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              options: q.options.map((o, oidx) => (oidx === oi ? val : o)),
            }
          : q
      )
    );

  return (
    <PageTransition>
      <div className={styles.pageContainer}>
        {/* 1. Page Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.pageTitle}>Assessments & Quizzes</h1>
              <span className={styles.headerBadge}>
                <Sparkles size={12} /> Evaluation Studio
              </span>
            </div>
            <p className={styles.pageSubtitle}>
              Author interactive multiple-choice tests, set lesson checkpoint benchmarks, and configure course certification exams.
            </p>
          </div>
          <button className={styles.primaryCreateBtn} onClick={openCreateQuiz}>
            <Plus size={18} /> Create Assessment
          </button>
        </div>

        {/* 2. Enterprise Metric Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconBlue}`}>
              <BookOpen size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalQuizzes}</div>
              <div className={styles.statLabel}>Total Assessments</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconPurple}`}>
              <HelpCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalQuestions}</div>
              <div className={styles.statLabel}>Questions Bank</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconEmerald}`}>
              <Award size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{finalAssessmentsCount}</div>
              <div className={styles.statLabel}>Final Exams</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconBox} ${styles.statIconAmber}`}>
              <CheckCircle2 size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{avgPassMark}%</div>
              <div className={styles.statLabel}>Avg Passing Mark</div>
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className={styles.toolbarCard}>
          <div className={styles.toolbarTop}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search assessments by title or course name..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className={styles.clearSearchBtn}
                  onClick={() => setSearch('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Course Filter Dropdown */}
            <select
              className={styles.courseSelectDropdown}
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
            >
              <option value="ALL">All Courses ({quizzes.length})</option>
              {uniqueCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.count})
                </option>
              ))}
            </select>

            <div className={styles.filterCountBadge}>
              Showing {filtered.length} of {quizzes.length} assessments
            </div>
          </div>

          {/* Assessment Type Filter Pills */}
          <div className={styles.filterPillsRow}>
            <button
              className={`${styles.filterPill} ${
                selectedTypeFilter === 'ALL' ? styles.filterPillActive : ''
              }`}
              onClick={() => setSelectedTypeFilter('ALL')}
            >
              All Types ({quizzes.length})
            </button>
            <button
              className={`${styles.filterPill} ${
                selectedTypeFilter === 'FINAL' ? styles.filterPillActive : ''
              }`}
              onClick={() => setSelectedTypeFilter('FINAL')}
            >
              <Award size={14} /> Final Exams ({finalAssessmentsCount})
            </button>
            <button
              className={`${styles.filterPill} ${
                selectedTypeFilter === 'MODULE' ? styles.filterPillActive : ''
              }`}
              onClick={() => setSelectedTypeFilter('MODULE')}
            >
              <Layers size={14} /> Module Checkpoints ({moduleQuizzesCount})
            </button>
          </div>
        </div>

        {/* 4. Quizzes Cards List */}
        <div className={styles.quizzesList}>
          {filtered.map((quiz) => {
            const visual = getCourseVisual(
              quiz.course?.category,
              quiz.course?.title,
              quiz.course?.logo
            );
            const isExpanded = expanded.has(quiz.id);

            return (
              <div key={quiz.id} className={styles.quizCard}>
                {/* Visual Accent Strip */}
                <div
                  className={`${styles.cardAccentStrip} ${
                    quiz.isFinalAssessment ? styles.accentEmerald : styles.accentSapphire
                  }`}
                />

                <div
                  className={styles.quizCardHeader}
                  onClick={() => toggle(quiz.id)}
                >
                  <div className={styles.quizHeaderLeft}>
                    <div
                      className={styles.chevronIcon}
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      <ChevronRight size={18} />
                    </div>

                    <div
                      className={styles.courseVisualBox}
                      style={{ background: visual.gradient, color: '#ffffff' }}
                    >
                      {visual.icon}
                    </div>

                    <div className={styles.quizInfoCol}>
                      <h3 className={styles.quizTitle}>{quiz.title}</h3>
                      <div className={styles.quizMetaRow}>
                        <span className={styles.courseNameTag}>
                          {quiz.course?.title ?? 'Unassigned Course'}
                        </span>
                        <span>&bull;</span>
                        <span>
                          {quiz.isFinalAssessment
                            ? 'Final Certification Exam'
                            : quiz.afterLessonId
                            ? 'Lesson Checkpoint'
                            : quiz.module
                            ? `Module: ${quiz.module.title}`
                            : 'Course Curriculum Quiz'}
                        </span>
                        <span>&bull;</span>
                        <span>{quiz.questions.length} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.quizHeaderRight}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.badgesGroup}>
                      {quiz.isFinalAssessment ? (
                        <span className={styles.typeBadgeFinal}>
                          <Award size={13} /> Final Exam
                        </span>
                      ) : (
                        <span className={styles.typeBadgeModule}>
                          <Layers size={13} /> Module Quiz
                        </span>
                      )}

                      <span className={styles.metaPill}>
                        <Clock size={12} /> {quiz.timeLimit} Mins
                      </span>

                      <span className={styles.metaPill}>
                        <Check size={12} /> Pass: {quiz.passMark || 70}%
                      </span>
                    </div>

                    <div className={styles.cardActionBtns}>
                      <button
                        className={styles.actionBtn}
                        title="Edit Quiz"
                        onClick={() => openEditQuiz(quiz)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDanger}`}
                        title="Delete Quiz"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Questions List */}
                {isExpanded && (
                  <div className={styles.questionsAccordion}>
                    <div className={styles.accordionTitle}>
                      Questions in this Assessment ({quiz.questions.length})
                    </div>

                    {quiz.questions.map((q, i) => {
                      const opts = (() => {
                        try {
                          return JSON.parse(q.options);
                        } catch {
                          return [];
                        }
                      })();

                      return (
                        <div key={q.id} className={styles.questionItemCard}>
                          <div className={styles.questionIndexBadge}>
                            Q{i + 1}
                          </div>
                          <div className={styles.questionBody}>
                            <div className={styles.questionPrompt}>{q.question}</div>
                            {opts.length > 0 && (
                              <div className={styles.optionsGrid}>
                                {opts.map((o: string, optIdx: number) => {
                                  const isCorrect = o === q.correctAnswer;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`${styles.optionChip} ${
                                        isCorrect ? styles.optionCorrect : ''
                                      }`}
                                    >
                                      <span>{o}</span>
                                      {isCorrect && (
                                        <span className={styles.correctTag}>
                                          <Check size={12} /> Correct
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {q.explanation && (
                              <div className={styles.explanationAlert}>
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            )}
                          </div>

                          <span className={styles.questionTypePill}>
                            {q.type === 'mcq'
                              ? 'MCQ'
                              : q.type === 'truefalse'
                              ? 'True/False'
                              : q.type}
                          </span>
                        </div>
                      );
                    })}

                    {quiz.questions.length === 0 && (
                      <div className={styles.emptyQuestionsState}>
                        No questions in this assessment yet. Click the Edit button above to add questions.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty Search / Filter State */}
          {filtered.length === 0 && (
            <div className={styles.emptyStateContainer}>
              <CircleHelp size={42} style={{ color: '#94a3b8', margin: '0 auto' }} />
              <h3 className={styles.emptyStateTitle}>No assessments found</h3>
              <p className={styles.emptyStateSubtitle}>
                No quizzes match your current search query or course filter. Clear your filters or create a new assessment.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setSelectedCourseFilter('ALL');
                  setSelectedTypeFilter('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* 5. Create / Edit Quiz Modal */}
        <AnimatePresence>
          {showQuizModal && (
            <div
              className={styles.modalBackdrop}
              onClick={() => !isLoading && setShowQuizModal(false)}
            >
              <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>
                    {editingQuiz ? 'Edit Assessment' : 'Create New Assessment'}
                  </h2>
                  <button
                    className={styles.actionBtn}
                    onClick={() => setShowQuizModal(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div className={styles.modalBody}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.formLabel}>Quiz Title *</label>
                        <input
                          className="input-field"
                          value={quizForm.title}
                          onChange={(e) =>
                            setQuizForm({ ...quizForm, title: e.target.value })
                          }
                          required
                          placeholder="e.g. SQL Queries & Database Design Final Assessment"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Target Course *</label>
                        <select
                          className="input-field"
                          value={quizForm.courseId}
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              courseId: e.target.value,
                              moduleId: '',
                              afterLessonId: '',
                              isFinalAssessment: false,
                            })
                          }
                          required
                        >
                          <option value="">Select a course...</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {quizForm.courseId && (
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.formLabel}>Curriculum Placement</label>
                          <select
                            className="input-field"
                            value={
                              quizForm.isFinalAssessment
                                ? 'FINAL'
                                : quizForm.afterLessonId
                                ? `LESSON_${quizForm.afterLessonId}`
                                : quizForm.moduleId
                                ? `MOD_${quizForm.moduleId}`
                                : 'FINAL'
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'FINAL') {
                                setQuizForm({
                                  ...quizForm,
                                  isFinalAssessment: true,
                                  afterLessonId: '',
                                  moduleId: '',
                                });
                              } else if (val.startsWith('LESSON_')) {
                                const lesId = val.replace('LESSON_', '');
                                const selectedCourse = courses.find(
                                  (c) => c.id === quizForm.courseId
                                );
                                let modId = '';
                                selectedCourse?.modules?.forEach((m) => {
                                  if (m.lessons?.some((l) => l.id === lesId)) modId = m.id;
                                });
                                setQuizForm({
                                  ...quizForm,
                                  isFinalAssessment: false,
                                  afterLessonId: lesId,
                                  moduleId: modId,
                                });
                              } else if (val.startsWith('MOD_')) {
                                setQuizForm({
                                  ...quizForm,
                                  isFinalAssessment: false,
                                  afterLessonId: '',
                                  moduleId: val.replace('MOD_', ''),
                                });
                              }
                            }}
                          >
                            <option value="FINAL">At the end of the course (Final Assessment)</option>
                            {courses
                              .find((c) => c.id === quizForm.courseId)
                              ?.modules?.map((m, mIdx) => (
                                <optgroup
                                  key={m.id}
                                  label={`Module ${mIdx + 1}: ${m.title}`}
                                >
                                  <option value={`MOD_${m.id}`}>
                                    At Module end (General Module Quiz)
                                  </option>
                                  {m.lessons?.map((les, lIdx) => (
                                    <option key={les.id} value={`LESSON_${les.id}`}>
                                      After Lesson {lIdx + 1}: {les.title}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                          </select>
                        </div>
                      )}

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Time Limit (Minutes) *</label>
                        <input
                          type="number"
                          className="input-field"
                          value={quizForm.timeLimit}
                          min={1}
                          required
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              timeLimit: Math.max(1, Number(e.target.value)),
                            })
                          }
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Passing Mark (%)</label>
                        <input
                          type="number"
                          className="input-field"
                          value={quizForm.passMark}
                          min={0}
                          max={100}
                          onChange={(e) =>
                            setQuizForm({
                              ...quizForm,
                              passMark: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Question Builder */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                        Questions in Assessment ({questions.length})
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addQuestion}
                      >
                        <PlusCircle size={15} /> Add Question
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {questions.map((q, i) => (
                        <div key={i} className={styles.questionBuilderCard}>
                          <div className={styles.builderHeader}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb' }}>
                              Question {i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(i)}
                              style={{
                                color: '#dc2626',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Remove Question
                            </button>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Question Text *</label>
                            <input
                              className="input-field"
                              value={q.question}
                              onChange={(e) =>
                                updateQuestion(i, 'question', e.target.value)
                              }
                              required
                              placeholder="e.g. What is the primary purpose of an index in SQL databases?"
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Question Type</label>
                              <select
                                className="input-field"
                                value={q.type}
                                onChange={(e) =>
                                  updateQuestion(i, 'type', e.target.value)
                                }
                              >
                                <option value="mcq">Multiple Choice (Single Answer)</option>
                                <option value="multiple">Multiple Choice (Multi Answer)</option>
                                <option value="truefalse">True / False</option>
                                <option value="fillin">Fill in the Blank</option>
                              </select>
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Correct Answer *</label>
                              {q.type === 'truefalse' ? (
                                <select
                                  className="input-field"
                                  value={q.correctAnswer}
                                  onChange={(e) =>
                                    updateQuestion(i, 'correctAnswer', e.target.value)
                                  }
                                >
                                  <option value="">Select...</option>
                                  <option>True</option>
                                  <option>False</option>
                                </select>
                              ) : (
                                <input
                                  className="input-field"
                                  value={q.correctAnswer}
                                  placeholder={
                                    q.type === 'multiple'
                                      ? 'Comma-separated: Option 1, Option 2'
                                      : 'Type exact matching answer'
                                  }
                                  onChange={(e) =>
                                    updateQuestion(i, 'correctAnswer', e.target.value)
                                  }
                                />
                              )}
                            </div>
                          </div>

                          {q.type !== 'truefalse' && q.type !== 'fillin' && (
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Answer Options</label>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                                {q.options.map((opt, oi) => (
                                  <input
                                    key={oi}
                                    className="input-field"
                                    value={opt}
                                    placeholder={`Option ${oi + 1}`}
                                    onChange={(e) =>
                                      updateOption(i, oi, e.target.value)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Explanation (Optional)</label>
                            <input
                              className="input-field"
                              value={q.explanation}
                              placeholder="Explain why this answer is correct..."
                              onChange={(e) =>
                                updateQuestion(i, 'explanation', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowQuizModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Saving...'
                        : editingQuiz
                        ? 'Update Assessment'
                        : 'Create Assessment'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

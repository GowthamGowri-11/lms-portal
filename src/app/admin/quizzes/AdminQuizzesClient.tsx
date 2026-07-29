'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, X, HelpCircle, ChevronDown,
  ChevronRight, Search, PlusCircle,
} from 'lucide-react';
import { FadeInUp, PageTransition } from '@/components/animations/MotionWrappers';
import { Quiz, QuizQuestion, Course, Module } from '@/generated/prisma/client';

type QuizWithData = Quiz & {
  questions: QuizQuestion[];
  course: Pick<Course, 'id' | 'title' | 'logo'> | null;
  module: Pick<Module, 'id' | 'title'> | null;
  afterLessonId?: string | null;
  isFinalAssessment?: boolean;
};

const QUESTION_TYPES = ['mcq', 'truefalse', 'multiple', 'fillin'];

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
  courses: (Pick<Course, 'id' | 'title' | 'logo'> & {
    modules?: { id: string; title: string; lessons?: { id: string; title: string }[] }[];
  })[];
  modules: Pick<Module, 'id' | 'title' | 'courseId'>[];
}) {
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithData | null>(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', moduleId: '', afterLessonId: '', isFinalAssessment: false, timeLimit: 10, passMark: 70 });
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState<typeof emptyQ[]>([{ ...emptyQ }]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [qForm, setQForm] = useState({ ...emptyQ });
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState('');

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

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = quizzes.filter((q) => {
    const matchesCourseFilter = selectedCourseFilter === 'ALL' || q.courseId === selectedCourseFilter;
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.course?.title.toLowerCase().includes(search.toLowerCase());
    return matchesCourseFilter && matchesSearch;
  });

  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({ title: '', description: '', courseId: selectedCourseFilter === 'ALL' ? '' : selectedCourseFilter, moduleId: '', afterLessonId: '', isFinalAssessment: false, timeLimit: 10, passMark: 70 });
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
    setQuestions(quiz.questions.map((q) => ({
      question: q.question,
      type: q.type,
      options: (() => { try { return JSON.parse(q.options); } catch { return ['', '', '', '']; } })(),
      correctAnswer: (() => { try { return typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer); } catch { return ''; } })(),
      explanation: q.explanation,
      order: q.order,
    })));
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
          options: JSON.stringify(q.type === 'truefalse' ? ['True', 'False'] : q.options.filter(Boolean)),
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
    } catch { alert('Error saving quiz'); }
    finally { setIsLoading(false); }
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
    setQuestions((p) => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOption = (qi: number, oi: number, val: string) =>
    setQuestions((p) => p.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? val : o) } : q));

  return (
    <PageTransition>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeInUp>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Quizzes</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Create and manage quizzes for courses and modules.</p>
            </div>
            <button className="btn btn-primary" onClick={openCreateQuiz}>
              <Plus size={18} /> Create Quiz
            </button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '4px' }}>Filter Course:</span>
            <button
              onClick={() => setSelectedCourseFilter('ALL')}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--glass-border)', cursor: 'pointer',
                background: selectedCourseFilter === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: selectedCourseFilter === 'ALL' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              All Courses ({quizzes.length})
            </button>
            {courses.map((c) => {
              const count = quizzes.filter((q) => q.courseId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseFilter(c.id)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--glass-border)', cursor: 'pointer',
                    background: selectedCourseFilter === c.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                    color: selectedCourseFilter === c.id ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {c.title} ({count})
                </button>
              );
            })}
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search quizzes..."
              className="input-field"
              style={{ paddingLeft: 44, background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 14 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </FadeInUp>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((quiz) => (
            <FadeInUp key={quiz.id}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', gap: '1rem' }}
                  onClick={() => toggle(quiz.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    {expanded.has(quiz.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(67,56,202,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{quiz.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        <img src={quiz.course?.logo || 'https://via.placeholder.com/150'} alt="" style={{ width: '1em', height: '1em', objectFit: 'contain', verticalAlign: 'middle', marginRight: '4px' }} /> {quiz.course?.title ?? 'No course'}
                        {quiz.isFinalAssessment ? ' • Final Assessment' : quiz.afterLessonId ? ' • Custom Lesson Placement' : quiz.module ? ` • ${quiz.module.title}` : ''} • {quiz.questions.length} questions
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--text-secondary)' }} onClick={() => openEditQuiz(quiz)}>
                      <Edit3 size={15} />
                    </button>
                    <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--text-secondary)' }} onClick={() => handleDeleteQuiz(quiz.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {expanded.has(quiz.id) && (
                  <div style={{ borderTop: '1px solid var(--glass-border)' }}>
                    {quiz.questions.map((q, i) => {
                      const opts = (() => { try { return JSON.parse(q.options); } catch { return []; } })();
                      return (
                        <div key={q.id} style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 24 }}>Q{i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>{q.question}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {opts.map((o: string) => (
                                <span key={o} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6, background: o === q.correctAnswer ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)', color: o === q.correctAnswer ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                                  {o}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(67,56,202,0.08)', color: 'var(--accent-primary)', borderRadius: 6, flexShrink: 0 }}>
                            {q.type}
                          </span>
                        </div>
                      );
                    })}
                    {quiz.questions.length === 0 && (
                      <div style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        No questions yet. Edit quiz to add questions.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* Quiz Modal */}
        <AnimatePresence>
          {showQuizModal && (
            <motion.div
              className="modal-overlay"
              style={{
                background: 'rgba(5, 8, 15, 0.85)',
                backdropFilter: 'blur(8px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowQuizModal(false)}
            >
              <motion.div
                className="modal-content"
                style={{
                  maxWidth: 950,
                  width: '95vw',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  backdropFilter: 'blur(20px)',
                }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header" style={{
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid var(--glass-border)',
                  marginBottom: 0,
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
                  <button className="modal-close" onClick={() => setShowQuizModal(false)} style={{ margin: 0 }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveQuiz} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}>
                    {/* Quiz Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Quiz Title *</label>
                        <input className="input-field" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Assign to Course</label>
                        <select className="input-field" value={quizForm.courseId} onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value, moduleId: '', afterLessonId: '', isFinalAssessment: false })}>
                          <option value="">No course</option>
                          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                      {quizForm.courseId && (
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Quiz Placement (Where it appears in curriculum)</label>
                          <select
                            className="input-field"
                            value={quizForm.isFinalAssessment ? 'FINAL' : quizForm.afterLessonId ? `LESSON_${quizForm.afterLessonId}` : quizForm.moduleId ? `MOD_${quizForm.moduleId}` : 'FINAL'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'FINAL') {
                                setQuizForm({ ...quizForm, isFinalAssessment: true, afterLessonId: '', moduleId: '' });
                              } else if (val.startsWith('LESSON_')) {
                                const lesId = val.replace('LESSON_', '');
                                const selectedCourse = courses.find((c) => c.id === quizForm.courseId);
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
                            {courses.find((c) => c.id === quizForm.courseId)?.modules?.map((m, mIdx) => (
                              <optgroup key={m.id} label={`Module ${mIdx + 1}: ${m.title}`}>
                                <option value={`MOD_${m.id}`}>At Module end (General Module Quiz)</option>
                                {m.lessons?.map((les, lIdx) => (
                                  <option key={les.id} value={`LESSON_${les.id}`}>After Lesson {lIdx + 1}: {les.title}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="input-group">
                        <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Time Limit (minutes) *</label>
                        <input type="number" className="input-field" value={quizForm.timeLimit} min={1} required onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Math.max(1, Number(e.target.value)) })} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>Quiz will auto-close when timer expires</span>
                      </div>
                      <div className="input-group">
                        <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Pass Mark (%)</label>
                        <input type="number" className="input-field" value={quizForm.passMark} min={0} max={100} onChange={(e) => setQuizForm({ ...quizForm, passMark: Number(e.target.value) })} />
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                      <div className="input-group" style={{ flex: '0 0 180px' }}>
                        <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>No. of Questions *</label>
                        <input type="number" className="input-field" value={numQuestions} min={1} required onChange={(e) => {
                          const n = Math.max(1, Number(e.target.value));
                          setNumQuestions(n);
                        }} />
                      </div>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: '2px' }} onClick={() => {
                        const n = numQuestions;
                        if (n < questions.length) {
                          setQuestions(questions.slice(0, n));
                        } else {
                          const extras = Array.from({ length: n - questions.length }, (_, i) => ({ ...emptyQ, order: questions.length + i }));
                          setQuestions([...questions, ...extras]);
                        }
                      }}>
                        <PlusCircle size={14} /> Generate {numQuestions} Placeholder{numQuestions > 1 ? 's' : ''}
                      </button>
                    </div>

                    {/* Questions Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Questions ({questions.length})</span>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        <PlusCircle size={14} /> Add Question
                      </button>
                    </div>

                    {/* Questions List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {questions.map((q, i) => (
                        <div key={i} style={{
                          background: 'rgba(15, 20, 35, 0.4)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 16,
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.25rem',
                          boxShadow: 'var(--glass-shadow)',
                        }}>
                          {/* Question Card Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary-light)' }}>Question {i + 1}</span>
                            <button type="button" onClick={() => removeQuestion(i)} style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              Remove
                            </button>
                          </div>

                          {/* Question Form Fields */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-group">
                              <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Question Text</label>
                              <input className="input-field" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                              <div className="input-group">
                                <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Question Type</label>
                                <select className="input-field" value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}>
                                  <option value="mcq">Multiple Choice (Single)</option>
                                  <option value="multiple">Multiple Choice (Multi)</option>
                                  <option value="truefalse">True / False</option>
                                  <option value="fillin">Fill in the Blank</option>
                                </select>
                              </div>

                              <div className="input-group">
                                <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Correct Answer</label>
                                {q.type === 'truefalse' ? (
                                  <select className="input-field" value={q.correctAnswer} onChange={(e) => updateQuestion(i, 'correctAnswer', e.target.value)}>
                                    <option value="">Select...</option>
                                    <option>True</option>
                                    <option>False</option>
                                  </select>
                                ) : (
                                  <input className="input-field" value={q.correctAnswer} placeholder={q.type === 'multiple' ? 'Comma-separated: Option1,Option2' : 'Correct answer'} onChange={(e) => updateQuestion(i, 'correctAnswer', e.target.value)} />
                                )}
                              </div>
                            </div>

                            {q.type !== 'truefalse' && q.type !== 'fillin' && (
                              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Options</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                  {q.options.map((opt, oi) => (
                                    <div key={oi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Option {oi + 1}</span>
                                      <input
                                        className="input-field"
                                        value={opt}
                                        placeholder={`Option ${oi + 1}`}
                                        onChange={(e) => updateOption(i, oi, e.target.value)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="input-group">
                              <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Explanation (optional)</label>
                              <input className="input-field" value={q.explanation} onChange={(e) => updateQuestion(i, 'explanation', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    padding: '1.25rem 2rem',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    background: 'rgba(10, 15, 25, 0.4)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

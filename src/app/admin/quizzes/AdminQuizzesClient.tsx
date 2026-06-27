'use client';

import { useState } from 'react';
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
  courses: Pick<Course, 'id' | 'title' | 'logo'>[];
  modules: Pick<Module, 'id' | 'title' | 'courseId'>[];
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithData | null>(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', moduleId: '', timeLimit: 10, passMark: 70 });
  const [questions, setQuestions] = useState<typeof emptyQ[]>([{ ...emptyQ }]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [qForm, setQForm] = useState({ ...emptyQ });
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState('');

  const toggle = (id: string) =>
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.course?.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({ title: '', description: '', courseId: '', moduleId: '', timeLimit: 10, passMark: 70 });
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
                        {quiz.course?.logo} {quiz.course?.title ?? 'No course'} {quiz.module ? `• ${quiz.module.title}` : ''} • {quiz.questions.length} questions
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setShowQuizModal(false)}
            >
              <motion.div
                className="modal-content"
                style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
                  <button className="modal-close" onClick={() => setShowQuizModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Quiz Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Quiz Title *</label>
                      <input className="input-field" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                    </div>
                    <div className="input-group">
                      <label>Assign to Course</label>
                      <select className="input-field" value={quizForm.courseId} onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value, moduleId: '' })}>
                        <option value="">No course</option>
                        {courses.map((c) => <option key={c.id} value={c.id}>{c.logo} {c.title}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Assign to Module</label>
                      <select className="input-field" value={quizForm.moduleId} onChange={(e) => setQuizForm({ ...quizForm, moduleId: e.target.value })}>
                        <option value="">No module</option>
                        {modules.filter((m) => !quizForm.courseId || m.courseId === quizForm.courseId).map((m) => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Time Limit (minutes, 0 = no limit)</label>
                      <input type="number" className="input-field" value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })} />
                    </div>
                    <div className="input-group">
                      <label>Pass Mark (%)</label>
                      <input type="number" className="input-field" value={quizForm.passMark} min={0} max={100} onChange={(e) => setQuizForm({ ...quizForm, passMark: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Questions */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Questions ({questions.length})</span>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
                        <PlusCircle size={14} /> Add Question
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {questions.map((q, i) => (
                        <div key={i} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Question {i + 1}</span>
                            <button type="button" onClick={() => removeQuestion(i)} style={{ color: 'var(--accent-danger)', fontSize: '0.75rem' }}>
                              Remove
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="input-group">
                              <label>Question Text</label>
                              <input className="input-field" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} required />
                            </div>

                            <div className="input-group">
                              <label>Question Type</label>
                              <select className="input-field" value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}>
                                <option value="mcq">Multiple Choice (Single)</option>
                                <option value="multiple">Multiple Choice (Multi)</option>
                                <option value="truefalse">True / False</option>
                                <option value="fillin">Fill in the Blank</option>
                              </select>
                            </div>

                            {q.type !== 'truefalse' && q.type !== 'fillin' && (
                              <div className="input-group">
                                <label>Options</label>
                                {q.options.map((opt, oi) => (
                                  <input
                                    key={oi}
                                    className="input-field"
                                    style={{ marginBottom: 6 }}
                                    value={opt}
                                    placeholder={`Option ${oi + 1}`}
                                    onChange={(e) => updateOption(i, oi, e.target.value)}
                                  />
                                ))}
                              </div>
                            )}

                            <div className="input-group">
                              <label>Correct Answer</label>
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

                            <div className="input-group">
                              <label>Explanation (optional)</label>
                              <input className="input-field" value={q.explanation} onChange={(e) => updateQuestion(i, 'explanation', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
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

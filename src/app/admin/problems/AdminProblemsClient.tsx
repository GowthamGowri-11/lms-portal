'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Code, Search } from 'lucide-react';
import { FadeInUp, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { CodingProblem, Lesson, Module, Course } from '@/generated/prisma/client';

type LessonWithCourse = {
  id: string;
  title: string;
  module: { course: { title: string; logo: string } };
};

type ProblemWithLesson = CodingProblem & {
  lesson: Pick<Lesson, 'id' | 'title'> | null;
};

const emptyForm = {
  title: '',
  difficulty: 'Easy',
  description: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  examples: '',
  visibleTests: '',
  hiddenTests: '',
  starterPython: '',
  starterJS: '',
  starterJava: '',
  starterCpp: '',
  timeLimit: 2,
  memoryLimit: 256,
  points: 10,
  lessonId: '',
};

const DIFF_COLORS: Record<string, string> = {
  Easy: 'badge-success',
  Medium: 'badge-warning',
  Hard: 'badge-danger',
};

export default function AdminProblemsClient({
  problems,
  lessons,
}: {
  problems: ProblemWithLesson[];
  lessons: LessonWithCourse[];
}) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProblemWithLesson | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: ProblemWithLesson) => {
    setEditing(p);
    const sc = (() => { try { return JSON.parse(p.starterCode); } catch { return {}; } })();
    setForm({
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      inputFormat: p.inputFormat,
      outputFormat: p.outputFormat,
      constraints: p.constraints,
      examples: (() => { try { return JSON.stringify(JSON.parse(p.examples), null, 2); } catch { return p.examples; } })(),
      visibleTests: (() => { try { return JSON.stringify(JSON.parse(p.visibleTests), null, 2); } catch { return p.visibleTests; } })(),
      hiddenTests: (() => { try { return JSON.stringify(JSON.parse(p.hiddenTests), null, 2); } catch { return p.hiddenTests; } })(),
      starterPython: sc.python ?? '',
      starterJS: sc.javascript ?? '',
      starterJava: sc.java ?? '',
      starterCpp: sc.cpp ?? '',
      timeLimit: p.timeLimit,
      memoryLimit: p.memoryLimit,
      points: p.points,
      lessonId: p.lessonId ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      ...(editing ? { id: editing.id } : {}),
      title: form.title,
      difficulty: form.difficulty,
      description: form.description,
      inputFormat: form.inputFormat,
      outputFormat: form.outputFormat,
      constraints: form.constraints,
      examples: form.examples || '[]',
      visibleTests: form.visibleTests || '[]',
      hiddenTests: form.hiddenTests || '[]',
      starterCode: JSON.stringify({
        python: form.starterPython,
        javascript: form.starterJS,
        java: form.starterJava,
        cpp: form.starterCpp,
      }),
      languages: JSON.stringify(['python', 'javascript', 'java', 'cpp']),
      timeLimit: form.timeLimit,
      memoryLimit: form.memoryLimit,
      points: form.points,
      lessonId: form.lessonId || null,
    };
    try {
      await fetch('/api/admin/problems', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowModal(false);
      window.location.reload();
    } catch { alert('Error saving problem'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coding problem?')) return;
    await fetch('/api/admin/problems', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    window.location.reload();
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeInUp>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Coding Problems</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Create and manage coding practice problems.</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Problem</button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="Search problems..." className="input-field" style={{ paddingLeft: 44, background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 14 }} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button key={d} className={`btn btn-sm ${diffFilter === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDiffFilter(d)}>{d}</button>
            ))}
          </div>
        </FadeInUp>

        <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p) => (
            <StaggerItem key={p.id}>
              <motion.div
                style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                whileHover={{ y: -2 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(67,56,202,0.08)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Code size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`badge ${DIFF_COLORS[p.difficulty] ?? 'badge-primary'}`}>{p.difficulty}</span>
                    {p.lesson && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>📎 {p.lesson.title}</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{p.points} pts • {p.timeLimit}s limit</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--text-secondary)' }} onClick={() => openEdit(p)}>
                    <Edit3 size={15} />
                  </button>
                  <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, color: 'var(--text-secondary)' }} onClick={() => handleDelete(p.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No problems found. Create your first one!</div>
          )}
        </StaggerContainer>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isLoading && setShowModal(false)}>
              <motion.div
                className="modal-content"
                style={{ maxWidth: 800, maxHeight: '90vh', overflowY: 'auto' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editing ? 'Edit Problem' : 'Add Coding Problem'}</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group" style={{ gridColumn: '1/-1' }}>
                      <label>Problem Title *</label>
                      <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="input-group">
                      <label>Difficulty</label>
                      <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Assign to Lesson</label>
                      <select className="input-field" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: e.target.value })}>
                        <option value="">No lesson</option>
                        {lessons.map((l) => (
                          <option key={l.id} value={l.id}>{l.module.course.logo} {l.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Points</label>
                      <input type="number" className="input-field" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
                    </div>
                    <div className="input-group">
                      <label>Time Limit (seconds)</label>
                      <input type="number" className="input-field" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })} />
                    </div>
                    <div className="input-group">
                      <label>Memory Limit (MB)</label>
                      <input type="number" className="input-field" value={form.memoryLimit} onChange={(e) => setForm({ ...form, memoryLimit: Number(e.target.value) })} />
                    </div>
                  </div>

                  {[
                    { label: 'Description *', key: 'description', required: true },
                    { label: 'Input Format', key: 'inputFormat' },
                    { label: 'Output Format', key: 'outputFormat' },
                    { label: 'Constraints', key: 'constraints' },
                  ].map(({ label, key, required }) => (
                    <div key={key} className="input-group">
                      <label>{label}</label>
                      <textarea className="input-field textarea-field" style={{ minHeight: 80 }} value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} />
                    </div>
                  ))}

                  {[
                    { label: 'Examples (JSON array)', key: 'examples', ph: '[{"input":"3 5","output":"8","explanation":"3+5=8"}]' },
                    { label: 'Visible Test Cases (JSON array)', key: 'visibleTests', ph: '[{"input":"3 5","expected":"8"}]' },
                    { label: 'Hidden Test Cases (JSON array)', key: 'hiddenTests', ph: '[{"input":"100 200","expected":"300"}]' },
                  ].map(({ label, key, ph }) => (
                    <div key={key} className="input-group">
                      <label>{label}</label>
                      <textarea className="input-field textarea-field" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: '0.82rem' }} placeholder={ph} value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                    </div>
                  ))}

                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: -8 }}>Starter Code</div>
                  {[
                    { label: 'Python', key: 'starterPython' },
                    { label: 'JavaScript', key: 'starterJS' },
                    { label: 'Java', key: 'starterJava' },
                    { label: 'C++', key: 'starterCpp' },
                  ].map(({ label, key }) => (
                    <div key={key} className="input-group">
                      <label>{label}</label>
                      <textarea className="input-field textarea-field" style={{ minHeight: 80, fontFamily: 'monospace', fontSize: '0.82rem' }} value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : (editing ? 'Update' : 'Create Problem')}
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

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  Award, ArrowLeft, AlertCircle, Shield, Lock, Send,
} from 'lucide-react';
import { Course, Quiz, QuizQuestion } from '@/generated/prisma/client';
import styles from './quiz.module.css';

type QuizWithQuestions = Quiz & { questions: QuizQuestion[] };

export default function QuizClient({
  quiz,
  course,
  student,
  attempts = [],
  hasAttempted = false,
  canRetake = false,
  retakeRequestStatus = null,
}: {
  quiz: QuizWithQuestions;
  course: Course;
  student: any;
  attempts?: any[];
  hasAttempted?: boolean;
  canRetake?: boolean;
  retakeRequestStatus?: string | null;
}) {
  const router = useRouter();
  
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retakeStatus, setRetakeStatus] = useState<string | null>(retakeRequestStatus);
  const [isRequestingRetake, setIsRequestingRetake] = useState(false);
  const [securityViolation, setSecurityViolation] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const questions = quiz.questions;
  const current = questions[currentIdx];

  // Determine if student is allowed to start the quiz
  const isBlocked = hasAttempted && !canRetake;

  const getOptions = (q: QuizQuestion): string[] => {
    try { return JSON.parse(q.options); } catch { return []; }
  };

  const getCorrect = (q: QuizQuestion): string | string[] => {
    if (q.type === 'multiple') {
      try { return JSON.parse(q.correctAnswer); } catch { return []; }
    }
    return q.correctAnswer;
  };

  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      const correctAns = getCorrect(q);
      if (!ans) return;
      if (q.type === 'multiple') {
        const ansArr = (ans as string[]).sort();
        const corrArr = (Array.isArray(correctAns) ? correctAns : [correctAns]).sort();
        if (JSON.stringify(ansArr) === JSON.stringify(corrArr)) correct++;
      } else {
        if ((ans as string).toLowerCase() === (correctAns as string).toLowerCase()) correct++;
      }
    });
    return correct;
  }, [answers, questions]);

  const handleSubmit = useCallback(async (violation?: string) => {
    if (isSubmitting || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    
    if (violation) setSecurityViolation(violation);

    // Exit fullscreen
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    
    const correctCount = calculateScore();
    const totalCount = questions.length;
    const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const hasPassed = scorePercentage >= quiz.passMark;

    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          quizId: quiz.id,
          answers: JSON.stringify(answers),
          score: correctCount,
          totalMarks: totalCount,
          percentage: scorePercentage,
          passed: hasPassed,
          timeTaken,
        }),
      });

      if (res.ok) {
        setPhase('result');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [student.id, quiz.id, quiz.passMark, answers, timeTaken, calculateScore, questions.length, router, isSubmitting]);

  // ═══════════════════════════════════════════════
  // ANTI-CHEATING SECURITY — ACTIVE DURING QUIZ
  // ═══════════════════════════════════════════════

  // Enter fullscreen when quiz starts
  useEffect(() => {
    if (phase !== 'quiz') return;
    
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen blocked by browser — submit immediately
        handleSubmit('Fullscreen is required to take this quiz.');
      }
    };
    
    enterFullscreen();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect fullscreen exit → auto-submit
  useEffect(() => {
    if (phase !== 'quiz') return;
    
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && phase === 'quiz' && !hasSubmittedRef.current) {
        handleSubmit('You exited fullscreen. Quiz auto-submitted.');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [phase, handleSubmit]);

  // Tab switch / window blur → auto-submit
  useEffect(() => {
    if (phase !== 'quiz') return;

    const onVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current) {
        handleSubmit('You switched tabs. Quiz auto-submitted.');
      }
    };

    const onBlur = () => {
      if (!hasSubmittedRef.current) {
        handleSubmit('You left the quiz window. Quiz auto-submitted.');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase, handleSubmit]);

  // Block keyboard shortcuts (copy, paste, devtools, PrintScreen)
  useEffect(() => {
    if (phase !== 'quiz') return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('').catch(() => {});
        return;
      }
      // Block F11 (fullscreen toggle)
      if (e.key === 'F11') {
        e.preventDefault();
        return;
      }
      // Block F12 (devtools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Block Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S
      if (e.ctrlKey && ['c', 'a', 'v', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // Block Ctrl+Shift+I/J/C (devtools)
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // Block Win+Shift+S (Windows screenshot)
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }
      // Block Escape (would exit fullscreen)
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [phase]);

  // Block right-click context menu
  useEffect(() => {
    if (phase !== 'quiz') return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, [phase]);

  // Block clipboard events
  useEffect(() => {
    if (phase !== 'quiz') return;

    const blockClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('paste', blockClipboard);
    return () => {
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('paste', blockClipboard);
    };
  }, [phase]);

  // Block drag and select
  useEffect(() => {
    if (phase !== 'quiz') return;

    const onDragStart = (e: DragEvent) => { e.preventDefault(); };
    const onSelectStart = (e: Event) => { e.preventDefault(); };

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('selectstart', onSelectStart);
    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('selectstart', onSelectStart);
    };
  }, [phase]);

  // ═══════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════

  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) {
      handleSubmit('Time expired. Quiz auto-submitted.');
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
      setTimeTaken((p) => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.abs(s) % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qId: string, val: string) => {
    const q = questions.find((x) => x.id === qId)!;
    if (q.type === 'multiple') {
      const prev = (answers[qId] as string[]) ?? [];
      const next = prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val];
      setAnswers({ ...answers, [qId]: next });
    } else {
      setAnswers({ ...answers, [qId]: val });
    }
  };

  const isAnswered = (qId: string) => {
    const a = answers[qId];
    return a !== undefined && (Array.isArray(a) ? a.length > 0 : a !== '');
  };

  // ═══════════════════════════════════════════════
  // RETAKE REQUEST HANDLER
  // ═══════════════════════════════════════════════

  const handleRequestRetake = async () => {
    setIsRequestingRetake(true);
    try {
      const res = await fetch('/api/quizzes/retake-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, quizId: quiz.id }),
      });
      if (res.ok) {
        setRetakeStatus('PENDING');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send retake request');
      }
    } catch {
      alert('Error sending retake request');
    } finally {
      setIsRequestingRetake(false);
    }
  };

  // ═══════════════════════════════════════════════
  // INTRO PHASE
  // ═══════════════════════════════════════════════

  if (phase === 'intro') {
    return (
      <div className={styles.page}>
        <Link href={`/courses/${course.id}`} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Course
        </Link>
        <motion.div className={styles.introCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.quizIcon}><AlertCircle size={36} /></div>
          <h1 className={styles.quizTitle}>{quiz.title}</h1>
          {quiz.description && <p className={styles.quizDesc}>{quiz.description}</p>}
          <div className={styles.quizMeta}>
            <div className={styles.quizMetaItem}>
              <AlertCircle size={16} />
              <span>{questions.length} Questions</span>
            </div>
            <div className={styles.quizMetaItem}>
              <Clock size={16} />
              <span>{quiz.timeLimit} Minutes</span>
            </div>
            <div className={styles.quizMetaItem}>
              <Award size={16} />
              <span>Pass Mark: {quiz.passMark}%</span>
            </div>
          </div>
          
          {attempts.length > 0 && (
            <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 12, textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Previous Attempts</h4>
              {attempts.map((att, i) => (
                <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span>Attempt {attempts.length - i}: {att.score}/{att.totalMarks} ({att.percentage}%)</span>
                  <span style={{ fontWeight: 700, color: att.passed ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {att.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Security Rules */}
          <div style={{ margin: '1rem 0', padding: '1rem 1.25rem', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield size={18} style={{ color: '#f87171' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f87171' }}>Exam Security Rules</span>
            </div>
            <ul className={styles.quizRules} style={{ margin: 0 }}>
              <li>The quiz runs in <strong>fullscreen mode only</strong>. Exiting fullscreen will auto-submit.</li>
              <li>Timer starts when you begin. The quiz will <strong>auto-close</strong> when time runs out.</li>
              <li><strong>Switching tabs</strong> or leaving the window will immediately end your quiz.</li>
              <li>Copy, paste, right-click, and screenshots are <strong>disabled</strong>.</li>
              <li>You can only attempt this quiz <strong>once</strong>. Retakes require approval.</li>
            </ul>
          </div>

          {/* Blocked — Already Attempted */}
          {isBlocked ? (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, marginBottom: '1rem' }}>
                <Lock size={20} style={{ color: '#fbbf24', marginBottom: 6 }} />
                <p style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>Quiz Already Attempted</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  You have already taken this quiz. To retake, request approval from your trainer or admin.
                </p>
              </div>

              {retakeStatus === 'PENDING' ? (
                <div style={{ padding: '10px 20px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Clock size={16} />
                  Retake Request Pending — Waiting for Approval
                </div>
              ) : retakeStatus !== 'APPROVED' ? (
                <button
                  className="btn btn-primary"
                  onClick={handleRequestRetake}
                  disabled={isRequestingRetake}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={16} />
                  {isRequestingRetake ? 'Sending Request...' : 'Request Retake'}
                </button>
              ) : null}
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => { hasSubmittedRef.current = false; setPhase('quiz'); }} style={{ marginTop: '1rem' }}>
              <Shield size={18} /> Start Secure Quiz
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RESULT PHASE
  // ═══════════════════════════════════════════════

  if (phase === 'result') {
    const correct = calculateScore();
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= quiz.passMark;

    return (
      <div className={styles.page}>
        {securityViolation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 20px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <Shield size={18} /> {securityViolation}
          </motion.div>
        )}
        <motion.div className={styles.resultCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div
            className={`${styles.resultIcon} ${passed ? styles.resultPass : styles.resultFail}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          >
            {passed ? <Award size={44} /> : <XCircle size={44} />}
          </motion.div>

          <h2 className={styles.resultTitle}>{passed ? '🎉 Congratulations!' : 'Keep Practicing!'}</h2>
          <p className={styles.resultSubtitle}>{passed ? 'You passed the quiz!' : `You need ${quiz.passMark}% to pass.`}</p>

          <div className={styles.scoreCircle}>
            <svg viewBox="0 0 120 120" className={styles.scoreRing}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
              <motion.circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke={passed ? 'var(--accent-success)' : 'var(--accent-danger)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                transform="rotate(-90 60 60)"
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - percentage / 100) }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </svg>
            <div className={styles.scoreText}>
              <span className={styles.scoreNum}>{percentage}%</span>
              <span className={styles.scoreLabel}>{passed ? 'PASSED' : 'FAILED'}</span>
            </div>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <CheckCircle size={20} className={styles.correctIcon} />
              <span>{correct} Correct</span>
            </div>
            <div className={styles.resultStat}>
              <XCircle size={20} className={styles.wrongIcon} />
              <span>{total - correct} Wrong</span>
            </div>
            <div className={styles.resultStat}>
              <Clock size={20} />
              <span>{formatTime(timeTaken)} Taken</span>
            </div>
          </div>

          {/* Review */}
          <div className={styles.reviewList}>
            <h3>Review Answers</h3>
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const correctAns = getCorrect(q);
              const isCorrect = (() => {
                if (!userAns) return false;
                if (q.type === 'multiple') {
                  const a = (userAns as string[]).sort();
                  const c = (Array.isArray(correctAns) ? correctAns : [correctAns]).sort();
                  return JSON.stringify(a) === JSON.stringify(c);
                }
                return (userAns as string).toLowerCase() === (correctAns as string).toLowerCase();
              })();

              return (
                <div key={q.id} className={`${styles.reviewItem} ${isCorrect ? styles.reviewCorrect : styles.reviewWrong}`}>
                  <div className={styles.reviewQ}>
                    <span className={styles.reviewNum}>Q{i + 1}.</span>
                    <span>{q.question}</span>
                    {isCorrect ? <CheckCircle size={16} className={styles.correctIcon} /> : <XCircle size={16} className={styles.wrongIcon} />}
                  </div>
                  {!isCorrect && (
                    <div className={styles.reviewAns}>
                      <span className={styles.wrongAns}>Your answer: {Array.isArray(userAns) ? userAns.join(', ') : (userAns ?? 'Not answered')}</span>
                      <span className={styles.correctAns}>Correct: {Array.isArray(correctAns) ? correctAns.join(', ') : correctAns}</span>
                      {q.explanation && <span className={styles.explanation}>{q.explanation}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.resultActions}>
            <Link href={`/courses/${course.id}`} className="btn btn-primary">
              Back to Course
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // QUIZ PHASE — SECURE EXAM MODE
  // ═══════════════════════════════════════════════

  const options = getOptions(current);
  const answered = questions.filter((q) => isAnswered(q.id)).length;

  return (
    <div className={styles.quizLayout} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Header */}
      <div className={styles.quizHeader}>
        <div className={styles.quizProgress}>
          <span>{currentIdx + 1} / {questions.length}</span>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
            <Shield size={12} /> SECURE
          </div>
          <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <div className={styles.quizBody}>
        {/* Question Panel */}
        <div className={styles.questionPanel}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.questionMeta}>
                <span className="badge badge-primary">Question {currentIdx + 1}</span>
                <span className={styles.qType}>{current.type.toUpperCase()}</span>
                {flagged.has(currentIdx) && (
                  <span className={styles.flagged}>⚑ Flagged</span>
                )}
              </div>

              <h2 className={styles.questionText}>{current.question}</h2>

              <div className={styles.options}>
                {options.map((opt) => {
                  const isSelected = current.type === 'multiple'
                    ? ((answers[current.id] as string[]) ?? []).includes(opt)
                    : answers[current.id] === opt;

                  return (
                    <motion.button
                      key={opt}
                      className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                      onClick={() => handleAnswer(current.id, opt)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className={`${styles.optionDot} ${isSelected ? styles.optionDotSelected : ''}`} />
                      <span>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Question Nav */}
          <div className={styles.questionNav}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className={`btn btn-ghost btn-sm ${styles.skipBtn}`}
              onClick={() => {
                setSkipped((p) => new Set([...p, currentIdx]));
                if (currentIdx < questions.length - 1) setCurrentIdx((p) => p + 1);
              }}
            >
              Skip
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
              disabled={currentIdx === questions.length - 1}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className={styles.navigator}>
          <div className={styles.navigatorHeader}>
            <span>Questions</span>
            <span className={styles.answeredCount}>{answered}/{questions.length} answered</span>
          </div>
          <div className={styles.questionGrid}>
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={`${styles.qBtn}
                  ${i === currentIdx ? styles.qBtnActive : ''}
                  ${isAnswered(q.id) ? styles.qBtnAnswered : ''}
                  ${skipped.has(i) && !isAnswered(q.id) ? styles.qBtnSkipped : ''}
                  ${flagged.has(i) ? styles.qBtnFlagged : ''}
                `}
                onClick={() => setCurrentIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.qBtnAnswered}`} /> Answered</div>
            <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.qBtnSkipped}`} /> Skipped</div>
            <div className={styles.legendItem}><div className={`${styles.legendDot} ${styles.qBtnActive}`} /> Current</div>
          </div>
        </div>
      </div>
    </div>
  );
}

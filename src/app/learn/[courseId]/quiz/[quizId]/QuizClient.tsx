'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  Award, RotateCcw, ArrowLeft, AlertCircle,
} from 'lucide-react';
import { Course, Quiz, QuizQuestion } from '@/generated/prisma/client';
import styles from './quiz.module.css';

type QuizWithQuestions = Quiz & { questions: QuizQuestion[] };

export default function QuizClient({
  quiz,
  course,
  student,
  attempts = [],
}: {
  quiz: QuizWithQuestions;
  course: Course;
  student: any;
  attempts?: any[];
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

  const questions = quiz.questions;
  const current = questions[currentIdx];

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

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
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
        alert('Failed to submit quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [student.id, quiz.id, quiz.passMark, answers, timeTaken, calculateScore, questions.length, router, isSubmitting]);

  // Timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (quiz.timeLimit > 0 && timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((p) => p - 1);
      setTimeTaken((p) => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, quiz.timeLimit, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.abs(s) % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qId: string, val: string) => {
    const q = questions.find((x) => x.id === qId)!;
    if (q.type === 'multiple') {
      const prev = (answers[qId] as string[]) ?? [];
      setAnswers((a) => ({
        ...a,
        [qId]: prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val],
      }));
    } else {
      setAnswers((a) => ({ ...a, [qId]: val }));
    }
  };

  const isAnswered = (qId: string) => {
    const a = answers[qId];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a !== '';
  };

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
            {quiz.timeLimit > 0 && (
              <div className={styles.quizMetaItem}>
                <Clock size={16} />
                <span>{quiz.timeLimit} Minutes</span>
              </div>
            )}
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

          <ul className={styles.quizRules}>
            <li>Read each question carefully before answering.</li>
            <li>You can navigate between questions freely.</li>
            {quiz.timeLimit > 0 && <li>Timer starts when you begin the quiz.</li>}
            <li>You can review flagged questions before submitting.</li>
          </ul>
          <button className="btn btn-primary btn-lg" onClick={() => setPhase('quiz')}>
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'result') {
    const correct = calculateScore();
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= quiz.passMark;

    return (
      <div className={styles.page}>
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
            <button className="btn btn-secondary" onClick={() => { setPhase('intro'); setAnswers({}); setCurrentIdx(0); setTimeLeft(quiz.timeLimit * 60); setTimeTaken(0); }}>
              <RotateCcw size={16} /> Retry Quiz
            </button>
            <Link href={`/courses/${course.id}`} className="btn btn-primary">
              Back to Course
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz phase
  const options = getOptions(current);
  const answered = questions.filter((q) => isAnswered(q.id)).length;

  return (
    <div className={styles.quizLayout}>
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
        {quiz.timeLimit > 0 && (
          <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        )}
        <button className="btn btn-danger btn-sm" onClick={handleSubmit} disabled={isSubmitting}>
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

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Lock,
  BookOpen, Code, FileText, ChevronDown, Menu, X,
  GraduationCap, Clock, HelpCircle,
} from 'lucide-react';
import type { Course, Module, Lesson, Quiz, CodingProblem } from '@/generated/prisma/client';
import { useLearn } from '@/app/learn/[courseId]/LearnContext';
import styles from './CourseSidebar.module.css';

interface ProgressionItem { id: string; type: 'lesson' | 'coding' | 'quiz'; title: string; url: string; }

const parseDurationToMinutes = (duration: string | null | undefined): number => {
  if (!duration) return 0;
  
  // Format: "MM:SS" or "HH:MM:SS" or "M"
  const parts = duration.split(':').map((part) => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] + Math.round(parts[1] / 60);
  } else if (parts.length === 1 && !isNaN(parts[0])) {
    // M
    return parts[0];
  }
  
  return 0;
};

type ModuleWithLessons = Module & { lessons: Lesson[] };

interface CourseSidebarProps {
  course: Course;
  student: any;
  modules: ModuleWithLessons[];
  codingProblems: CodingProblem[];
  quizzes: Quiz[];
  completedIds: Set<string>;
  lockedIds: Set<string>;
  items: ProgressionItem[];
}

export default function CourseSidebar({
  course,
  student,
  modules,
  codingProblems,
  quizzes,
  completedIds,
  lockedIds,
  items,
}: CourseSidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } = useLearn();
  
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Find active item from pathname
  const getActiveItem = (): { type: 'lesson' | 'coding' | 'quiz'; id: string } | null => {
    if (!pathname) return null;
    if (pathname.includes('/problem/') || pathname.includes('/practice/')) {
      // Find which module the active coding problem belongs to
      // URL pattern: /practice/[problemId] or /learn/[courseId]/lesson/[lessonId]/problem/[problemId]
      const parts = pathname.split('/');
      const problemId = parts[parts.length - 1];
      const prob = codingProblems.find((p) => p.id === problemId);
      if (prob?.lessonId) {
        const les = modules.flatMap((m) => m.lessons).find((l) => l.id === prob.lessonId);
        if (les) {
          return { type: 'coding', id: les.moduleId };
        }
      }
      return null;
    } else if (pathname.includes('/lesson/')) {
      const parts = pathname.split('/');
      const lessonId = parts[parts.length - 1];
      return { type: 'lesson', id: lessonId };
    } else if (pathname.includes('/quiz/')) {
      const parts = pathname.split('/');
      const quizId = parts[parts.length - 1];
      return { type: 'quiz', id: quizId };
    }
    return null;
  };

  const activeItem = getActiveItem();

  // Progress stats calculation
  const completedCount = completedIds.size;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - completedCount;

  // Estimate remaining time
  const getRemainingTime = () => {
    let totalMins = 0;
    
    // Sum duration of incomplete lessons
    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (!completedIds.has(les.id)) {
          totalMins += parseDurationToMinutes(les.duration);
        }
      });
    });

    // Add time limit of incomplete quizzes
    quizzes.forEach((q) => {
      if (!completedIds.has(q.id)) {
        totalMins += q.timeLimit || 10; // Assume 10 mins if limit is 0
      }
    });

    if (totalMins === 0) return '0 min';
    if (totalMins < 60) return `${totalMins} min`;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const renderLessonsList = (mod: ModuleWithLessons) => {
    const list: ReactNode[] = [];

    // 1. Render Lessons
    mod.lessons.forEach((les) => {
      const isActive = activeItem?.type === 'lesson' && activeItem.id === les.id;
      const isDone = completedIds.has(les.id);
      const isLocked = lockedIds.has(les.id);

      if (isLocked) {
        list.push(
          <div key={`les-lock-${les.id}`} className={styles.sidebarLessonLocked}>
            <div className={styles.sidebarLessonIcon}>
              <Lock size={13} className={styles.lockedIcon} />
            </div>
            <span className={styles.sidebarLessonTitle}>{les.title}</span>
            {les.duration && <span className={styles.sidebarLessonDur}>{les.duration}</span>}
          </div>
        );
      } else {
        list.push(
          <Link
            key={`les-${les.id}`}
            href={`/learn/${course.id}/lesson/${les.id}`}
            className={`${styles.sidebarLesson} ${isActive ? styles.sidebarLessonActive : ''}`}
          >
            <div className={styles.sidebarLessonIcon}>
              {isDone ? (
                <CheckCircle size={14} className={styles.doneIcon} />
              ) : isActive ? (
                <Play size={12} className={styles.activeIcon} />
              ) : (
                <Play size={12} className={styles.pendingIcon} />
              )}
            </div>
            <span className={styles.sidebarLessonTitle}>{les.title}</span>
            {les.duration && <span className={styles.sidebarLessonDur}>{les.duration}</span>}
          </Link>
        );
      }
    });

    // 2. Render Coding Practice (if any)
    const modProblems = codingProblems.filter(
      (p) => p.lessonId && mod.lessons.some((l) => l.id === p.lessonId)
    );
    if (modProblems.length > 0) {
      const isActive = activeItem?.type === 'coding' && activeItem.id === mod.id;
      const isDone = modProblems.every((p) => completedIds.has(mod.id) || false); // Or checked via item completion
      const isLocked = lockedIds.has(mod.id);

      if (isLocked) {
        list.push(
          <div key={`cod-lock-${mod.id}`} className={styles.sidebarLessonLocked}>
            <div className={styles.sidebarLessonIcon}>
              <Lock size={13} className={styles.lockedIcon} />
            </div>
            <span className={styles.sidebarLessonTitle}>Coding Practice</span>
          </div>
        );
      } else {
        const targetUrl = `/learn/${course.id}/lesson/${mod.lessons[0].id}/problem/${modProblems[0].id}`;
        list.push(
          <Link
            key={`cod-${mod.id}`}
            href={targetUrl}
            className={`${styles.sidebarLesson} ${isActive ? styles.sidebarLessonActive : ''}`}
          >
            <div className={styles.sidebarLessonIcon}>
              {completedIds.has(mod.id) ? (
                <CheckCircle size={14} className={styles.doneIcon} />
              ) : isActive ? (
                <Code size={13} className={styles.activeIcon} />
              ) : (
                <Code size={13} className={styles.pendingIcon} />
              )}
            </div>
            <span className={styles.sidebarLessonTitle}>Coding Practice</span>
            <span className={styles.sidebarLessonDur}>{modProblems.length} problems</span>
          </Link>
        );
      }
    }

    // 3. Render Module Quiz (if any)
    const modQuiz = quizzes.find((q) => q.moduleId === mod.id);
    if (modQuiz) {
      const isActive = activeItem?.type === 'quiz' && activeItem.id === modQuiz.id;
      const isDone = completedIds.has(modQuiz.id);
      const isLocked = lockedIds.has(modQuiz.id);

      if (isLocked) {
        list.push(
          <div key={`q-lock-${modQuiz.id}`} className={styles.sidebarLessonLocked}>
            <div className={styles.sidebarLessonIcon}>
              <Lock size={13} className={styles.lockedIcon} />
            </div>
            <span className={styles.sidebarLessonTitle}>Module Quiz</span>
          </div>
        );
      } else {
        list.push(
          <Link
            key={`q-${modQuiz.id}`}
            href={`/learn/${course.id}/quiz/${modQuiz.id}`}
            className={`${styles.sidebarLesson} ${isActive ? styles.sidebarLessonActive : ''}`}
          >
            <div className={styles.sidebarLessonIcon}>
              {isDone ? (
                <CheckCircle size={14} className={styles.doneIcon} />
              ) : isActive ? (
                <HelpCircle size={13} className={styles.activeIcon} />
              ) : (
                <HelpCircle size={13} className={styles.pendingIcon} />
              )}
            </div>
            <span className={styles.sidebarLessonTitle}>Module Quiz</span>
          </Link>
        );
      }
    }

    return list;
  };

  const sidebarContent = (
    <>
      {/* Course back / Title */}
      <div className={styles.sidebarHeader}>
        <Link href={`/courses/${course.id}`} className={styles.sidebarBack}>
          <GraduationCap size={18} />
          <span className={styles.sidebarCourseName}>{course.title}</span>
        </Link>
        <button
          className={styles.sidebarToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {sidebarOpen && (
        <>
          {/* Progress Widget */}
          <div className={styles.progressWidget}>
            <div className={styles.progressHeader}>
              <span>Course Progress</span>
              <span className={styles.progressPercentage}>{percentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
            </div>
            <div className={styles.progressStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{completedCount}</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{remainingCount}</span>
                <span className={styles.statLabel}>Remaining</span>
              </div>
            </div>
            <div className={styles.timeRemaining}>
              <Clock size={12} />
              <span>Est. Time Left: {getRemainingTime()}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarLabel}>Course Content</div>
            {modules.map((mod) => (
              <div key={mod.id} className={styles.sidebarModule}>
                <button
                  className={styles.sidebarModuleHeader}
                  onClick={() => toggleModule(mod.id)}
                >
                  {expandedModules.has(mod.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span>{mod.title}</span>
                </button>

                {expandedModules.has(mod.id) && (
                  <div className={styles.sidebarLessons}>
                    {renderLessonsList(mod)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              className={styles.mobileSidebar}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className={styles.mobileSidebarHeader}>
                <span>Course Content</span>
                <button
                  className={styles.mobileClose}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

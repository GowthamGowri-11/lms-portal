import { prisma } from '@/lib/prisma';
import { DEVELOPMENT_MODE } from '@/lib/config';

export interface ProgressionItem {
  type: 'lesson' | 'coding' | 'quiz';
  id: string; // lessonId, moduleId (for coding), quizId (for quiz)
  moduleId: string;
  title: string;
  url: string;
  problems?: any[];
  quizId?: string;
}

export function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/(\d+)\s*(min|minute|hr|hour)/i);
  if (!match) {
    const num = parseInt(durationStr);
    return isNaN(num) ? 0 : num;
  }
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('hr') || unit.startsWith('hour')) {
    return val * 60;
  }
  return val;
}

export async function getCourseProgression(courseId: string, studentId: string) {
  // Fetch modules and lessons
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });

  // Fetch coding problems for these lessons
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const codingProblems = await prisma.codingProblem.findMany({
    where: { lessonId: { in: lessonIds } },
  });

  // Fetch quizzes for this course
  const quizzes = await prisma.quiz.findMany({
    where: { courseId },
  });

  // Fetch progress records
  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { studentId, lessonId: { in: lessonIds } },
  });

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { studentId, quizId: { in: quizzes.map((q) => q.id) } },
  });

  const submissions = await prisma.codingSubmission.findMany({
    where: { studentId, problemId: { in: codingProblems.map((p) => p.id) } },
  });

  // Map progress statuses
  const completedLessonIds = new Set(lessonProgress.filter((p) => p.completed).map((p) => p.lessonId));
  const solvedProblemIds = new Set(submissions.filter((s) => s.status === 'success' || s.status === 'Accepted').map((s) => s.problemId));
  const passedQuizIds = new Set(quizAttempts.filter((q) => q.passed).map((q) => q.quizId));

  // Build sequential list of items
  const items: ProgressionItem[] = [];

  for (const mod of modules) {
    for (const les of mod.lessons) {
      items.push({
        type: 'lesson',
        id: les.id,
        moduleId: mod.id,
        title: les.title,
        url: `/learn/${courseId}/lesson/${les.id}`,
      });
    }

    const modProblems = codingProblems.filter((p) => p.lessonId && mod.lessons.some((l) => l.id === p.lessonId));
    if (modProblems.length > 0) {
      items.push({
        type: 'coding',
        id: mod.id, // Module ID represents this module's coding practice
        moduleId: mod.id,
        title: 'Coding Practice',
        url: `/practice/${modProblems[0].id}`, // point to first problem
        problems: modProblems,
      });
    }

    const modQuiz = quizzes.find((q) => q.moduleId === mod.id);
    if (modQuiz) {
      items.push({
        type: 'quiz',
        id: modQuiz.id,
        moduleId: mod.id,
        title: 'Module Quiz',
        url: `/learn/${courseId}/quiz/${modQuiz.id}`,
        quizId: modQuiz.id,
      });
    }
  }

  // Calculate completion and locked states
  const completedIds = new Set<string>();
  const lockedIds = new Set<string>();

  // If in development mode, skip locking logic entirely
  if (DEVELOPMENT_MODE) {
    // Populate completedIds as normal but keep lockedIds empty
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let isCompleted = false;
      if (item.type === 'lesson') {
        isCompleted = completedLessonIds.has(item.id);
      } else if (item.type === 'coding') {
        isCompleted = item.problems?.every((p) => solvedProblemIds.has(p.id)) || false;
      } else if (item.type === 'quiz') {
        isCompleted = passedQuizIds.has(item.id);
      }
      if (isCompleted) completedIds.add(item.id);
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check completion
      let isCompleted = false;
      if (item.type === 'lesson') {
        isCompleted = completedLessonIds.has(item.id);
      } else if (item.type === 'coding') {
        isCompleted = item.problems?.every((p) => solvedProblemIds.has(p.id)) || false;
      } else if (item.type === 'quiz') {
        isCompleted = passedQuizIds.has(item.id);
      }
      
      if (isCompleted) {
        completedIds.add(item.id);
      }

      // Check locking (first item is always unlocked)
      let isLocked = false;
      if (i > 0) {
        const prevItem = items[i - 1];
        let prevCompleted = false;
        if (prevItem.type === 'lesson') {
          prevCompleted = completedLessonIds.has(prevItem.id);
        } else if (prevItem.type === 'coding') {
          prevCompleted = prevItem.problems?.every((p) => solvedProblemIds.has(p.id)) || false;
        } else if (prevItem.type === 'quiz') {
          prevCompleted = passedQuizIds.has(prevItem.id);
        }
        
        // Locked if previous item was not completed or if previous item itself was locked
        isLocked = !prevCompleted || lockedIds.has(prevItem.id);
      }

      if (isLocked) {
        lockedIds.add(item.id);
      }
    }
  }

  return {
    items,
    completedIds,
    lockedIds,
    solvedProblemIds,
    completedLessonIds,
    passedQuizIds,
    modules,
    codingProblems,
    quizzes,
  };
}

export async function updateProgressInDb(courseId: string, studentId: string) {
  const { items, completedIds } = await getCourseProgression(courseId, studentId);

  const completedCount = completedIds.size;
  const totalCount = items.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get last completed/visited lesson
  const lastLesson = items.filter((it) => it.type === 'lesson' && completedIds.has(it.id)).pop();

  await prisma.courseProgress.upsert({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    update: {
      completedLessons: completedCount,
      totalLessons: totalCount,
      percentage,
      lastLessonId: lastLesson?.id ?? '',
      isCompleted: completedCount === totalCount,
      completedAt: completedCount === totalCount ? new Date() : null,
    },
    create: {
      studentId,
      courseId,
      completedLessons: completedCount,
      totalLessons: totalCount,
      percentage,
      lastLessonId: lastLesson?.id ?? '',
      isCompleted: completedCount === totalCount,
      completedAt: completedCount === totalCount ? new Date() : null,
    },
  });

  // Sync to enrollment progress (integer 0-100)
  await prisma.enrollment.update({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    data: {
      progress: Math.round(percentage),
    },
  });
}

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PracticePageContent from '@/components/practice/PracticePageContent';


export default async function PracticePage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = await params;

  // Fetch problem with related lesson & course for navigation
  const problem = await prisma.codingProblem.findUnique({
    where: { id: problemId },
    include: { lesson: { include: { module: { include: { course: true } } } } },
  });
  if (!problem) notFound();

  // Load visible test cases (for optional display)
  const visibleTests = (() => {
    try {
      return JSON.parse(problem.visibleTests as unknown as string);
    } catch {
      return [];
    }
  })();

  // Additional data for sidebar
  const course = problem.lesson?.module?.course;
  const modules = course
    ? await prisma.module.findMany({
        where: { courseId: course.id },
        include: { lessons: true },
      })
    : [];
  const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const codingProblems = await prisma.codingProblem.findMany({
    where: { lessonId: { in: allLessonIds } },
  });
  const quizzes = course
    ? await prisma.quiz.findMany({ where: { courseId: course.id } })
    : [];

  const emptySet = new Set<string>();

  return (
    <PracticePageContent
      problem={problem}
      visibleTests={visibleTests}
      course={course}
      modules={modules as any}
      codingProblems={codingProblems}
      quizzes={quizzes}
    />
  );
}

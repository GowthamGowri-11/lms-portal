import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './QuizClient';
import { getCourseProgression } from '@/lib/progression';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });

  if (!quiz) notFound();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) notFound();

  // Get student (demo user)
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        name: 'Sample Student',
        email: 'student@gmtraining.com',
      },
    });
  }

  // Check progression locks
  const { items, lockedIds } = await getCourseProgression(courseId, student.id);

  if (lockedIds.has(quizId)) {
    // Redirect to the last unlocked item
    let activeItem = items[0];
    for (let i = items.length - 1; i >= 0; i--) {
      if (!lockedIds.has(items[i].id)) {
        activeItem = items[i];
        break;
      }
    }
    redirect(activeItem.url);
  }

  // Get student's previous attempts for this quiz
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: student.id,
      quizId,
    },
    orderBy: { completedAt: 'desc' },
  });

  return (
    <QuizClient
      quiz={quiz}
      course={course}
      student={student}
      attempts={attempts}
    />
  );
}

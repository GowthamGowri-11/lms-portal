import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import CodingProblemClient from './CodingProblemClient';
import { getCourseProgression } from '@/lib/progression';

export default async function CodingProblemPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string; problemId: string }>;
}) {
  const { courseId, lessonId, problemId } = await params;

  const problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
  if (!problem) notFound();

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

  // Find the lesson to get the moduleId
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) notFound();

  // The coding practice item in progression is identified by moduleId
  if (lockedIds.has(lesson.moduleId)) {
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

  // Get student's previous submissions for this problem
  const submissions = await prisma.codingSubmission.findMany({
    where: {
      studentId: student.id,
      problemId,
    },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <CodingProblemClient
      problem={problem}
      course={course}
      lessonId={lessonId}
      student={student}
      submissions={submissions}
    />
  );
}

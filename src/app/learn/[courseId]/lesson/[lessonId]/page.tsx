import { prisma } from '@/lib/prisma';
import { DEVELOPMENT_MODE } from '@/lib/config';
import { notFound, redirect } from 'next/navigation';
import LessonClient from './LessonClient';
import { getCourseProgression } from '@/lib/progression';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) notFound();

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) notFound();

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

  // Check locking
  const { items, lockedIds, modules, codingProblems } = await getCourseProgression(courseId, student.id);

  // In development mode, bypass lesson locking
  if (!DEVELOPMENT_MODE && lockedIds.has(lessonId)) {
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

  // Load lesson progress for the current student
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId,
      },
    },
  });

    // Ensure lesson progress record exists
  await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      lessonId,
      completed: false,
    },
  });

  // Find prev/next items
  const currentIdx = items.findIndex((it) => it.type === 'lesson' && it.id === lessonId);
  const prevItem = currentIdx > 0 ? items[currentIdx - 1] : null;
  const nextItem = currentIdx < items.length - 1 ? items[currentIdx + 1] : null;

  return (
    <LessonClient
      course={course}
      lesson={lesson}
      student={student}
      initialProgress={progress}
      prevItem={prevItem}
      nextItem={nextItem}
      codingProblems={codingProblems.filter((p) => p.lessonId === lessonId)}
    />
  );
}

import { prisma } from '@/lib/prisma';
import { DEVELOPMENT_MODE } from '@/lib/config';
import { notFound, redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import LessonClient from './LessonClient';
import { getCourseProgression } from '@/lib/progression';

const getCachedCourse = unstable_cache(
  async (id: string) => prisma.course.findUnique({ where: { id } }),
  ['course-by-id'],
  { revalidate: 3600 }
);

const getCachedLesson = unstable_cache(
  async (id: string) => prisma.lesson.findUnique({ where: { id } }),
  ['lesson-by-id'],
  { revalidate: 3600 }
);

const getCachedLessonData = unstable_cache(
  async (lessonId: string) => {
    const [notes, resources, assignments, practiceFiles] = await Promise.all([
      prisma.lessonNote.findMany({
        where: { lessonId, visibility: { not: 'Private' } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lessonResource.findMany({
        where: { lessonId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.lessonAssignment.findMany({
        where: { lessonId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.lessonPracticeFile.findMany({
        where: { lessonId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return { notes, resources, assignments, practiceFiles };
  },
  ['lesson-data-by-id'],
  { revalidate: 3600 }
);

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const course = await getCachedCourse(courseId);
  if (!course) notFound();

  const lesson = await getCachedLesson(lessonId);
  if (!lesson) notFound();

  // Get student (demo user)
  let student = await prisma.student.findFirst();
  if (!student) {
    student = await prisma.student.create({
      data: {
        name: 'Sample Student',
        email: 'student@atlyx.com',
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

  const lessonData = await getCachedLessonData(lessonId);

  return (
    <LessonClient
      course={course}
      lesson={lesson}
      student={student}
      initialProgress={progress}
      prevItem={prevItem}
      nextItem={nextItem}
      codingProblems={codingProblems.filter((p) => p.lessonId === lessonId)}
      lessonNotes={lessonData.notes}
      lessonResources={lessonData.resources}
      lessonAssignments={lessonData.assignments}
      lessonPracticeFiles={lessonData.practiceFiles}
    />
  );
}


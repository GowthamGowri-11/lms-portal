import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import CoursesClient from './CoursesClient';

export const revalidate = 3600; // Cache this page for 1 hour

export default async function CoursesPage() {
  const raw = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });
  const trainers = await prisma.trainer.findMany();
  const courses = raw.map(parseCourse);

  return <CoursesClient courses={courses} trainers={trainers} />;
}

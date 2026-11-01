import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import CoursesClient from './CoursesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CoursesPage() {
  const [raw, trainers] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trainer.findMany(),
  ]);
  const courses = raw.map(parseCourse);

  return <CoursesClient courses={courses} trainers={trainers} />;
}

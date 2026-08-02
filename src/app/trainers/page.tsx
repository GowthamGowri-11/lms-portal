import { prisma } from '@/lib/prisma';
import TrainersClient from './TrainersClient';

export const revalidate = 3600; // Cache this page for 1 hour
export default async function TrainersPage() {
  const [trainers, rawCourses] = await Promise.all([
    prisma.trainer.findMany({ orderBy: { name: 'asc' } }),
    prisma.course.findMany({
      select: { id: true, title: true, logo: true, trainerId: true, isPublished: true },
    }),
  ]);

  const courses = rawCourses.map((c) => ({
    id: c.id,
    title: c.title,
    logo: c.logo,
    trainerId: c.trainerId,
    isPublished: c.isPublished,
  }));

  return <TrainersClient trainers={trainers} courses={courses} />;
}

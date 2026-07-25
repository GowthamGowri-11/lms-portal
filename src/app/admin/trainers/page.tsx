import { prisma } from '@/lib/prisma';
import AdminTrainersClient from './AdminTrainersClient';

export default async function AdminTrainersPage() {
  const trainers = await prisma.trainer.findMany({ orderBy: { createdAt: 'desc' } });

  const rawCourses = await prisma.course.findMany({
    select: { id: true, title: true, logo: true, trainerId: true },
  });

  const courses = rawCourses.map((c) => ({
    id: c.id,
    title: c.title,
    logo: c.logo,
    trainerId: c.trainerId,
  }));

  return <AdminTrainersClient initialTrainers={trainers} courses={courses} />;
}

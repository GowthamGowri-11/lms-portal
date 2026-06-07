import { prisma } from '@/lib/prisma';
import AdminTrainersClient from './AdminTrainersClient';

export default async function AdminTrainersPage() {
  const trainers = await prisma.trainer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, logo: true, trainerId: true }
  });

  return <AdminTrainersClient initialTrainers={trainers} courses={courses as any} />;
}

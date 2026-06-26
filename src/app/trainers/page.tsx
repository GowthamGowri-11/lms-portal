import { prisma } from '@/lib/prisma';
import TrainersClient from './TrainersClient';

export default async function TrainersPage() {
  const trainers = await prisma.trainer.findMany({
    orderBy: { name: 'asc' },
  });
  
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, logo: true, trainerId: true, isPublished: true }
  });

  return <TrainersClient trainers={trainers} courses={courses as unknown as { id: string; title: string; logo: string; trainerId: string; isPublished: boolean }[]} />;
}

import { prisma } from '@/lib/prisma';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const trainers = await prisma.trainer.findMany();

  return <CoursesClient courses={courses} trainers={trainers} />;
}

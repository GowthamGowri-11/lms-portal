import { prisma } from '@/lib/prisma';
import AdminCoursesClient from './AdminCoursesClient';

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  const trainers = await prisma.trainer.findMany({
    orderBy: { name: 'asc' },
  });

  return <AdminCoursesClient initialCourses={courses} trainers={trainers} />;
}

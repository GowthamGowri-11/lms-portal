import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminCoursesClient from './AdminCoursesClient';

export default async function AdminCoursesPage() {
  const raw = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  const trainers = await prisma.trainer.findMany({ orderBy: { name: 'asc' } });
  const courses = raw.map(parseCourse);

  return <AdminCoursesClient initialCourses={courses} trainers={trainers} />;
}

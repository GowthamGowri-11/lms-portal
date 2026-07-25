import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const raw = await prisma.course.findMany();
  const courses = raw.map(parseCourse);
  const trainers = await prisma.trainer.findMany();
  const students = await prisma.student.findMany();
  const enrollments = await prisma.enrollment.findMany();

  return (
    <AdminDashboardClient
      courses={courses}
      trainers={trainers}
      students={students}
      enrollments={enrollments}
    />
  );
}

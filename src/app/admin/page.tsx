import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const [raw, trainers, students, enrollments] = await Promise.all([
    prisma.course.findMany(),
    prisma.trainer.findMany(),
    prisma.student.findMany(),
    prisma.enrollment.findMany(),
  ]);
  const courses = raw.map(parseCourse);

  return (
    <AdminDashboardClient
      courses={courses}
      trainers={trainers}
      students={students}
      enrollments={enrollments}
    />
  );
}

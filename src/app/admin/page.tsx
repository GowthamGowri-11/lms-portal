import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const courses = await prisma.course.findMany();
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

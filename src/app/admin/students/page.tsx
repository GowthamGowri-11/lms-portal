import { prisma } from '@/lib/prisma';
import AdminStudentsClient from './AdminStudentsClient';

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany();
  const courses = await prisma.course.findMany();
  const enrollments = await prisma.enrollment.findMany();

  return <AdminStudentsClient students={students} courses={courses} enrollments={enrollments} />;
}

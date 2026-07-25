import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import AdminStudentsClient from './AdminStudentsClient';

export default async function AdminStudentsPage() {
  const raw = await prisma.course.findMany();
  const courses = raw.map(parseCourse);
  const students = await prisma.student.findMany();
  const enrollments = await prisma.enrollment.findMany();

  return <AdminStudentsClient students={students} courses={courses} enrollments={enrollments} />;
}

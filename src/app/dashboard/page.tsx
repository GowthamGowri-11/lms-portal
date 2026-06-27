import { prisma } from '@/lib/prisma';
import { parseCourse } from '@/lib/utils';
import Navbar from '@/components/ui/Navbar';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Use sample student for demo
  const student = await prisma.student.findFirst();

  const enrollments = student
    ? await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { course: true },
      })
    : [];

  const quizAttempts = student
    ? await prisma.quizAttempt.findMany({
        where: { studentId: student.id },
        include: { quiz: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
      })
    : [];

  const certificates = student
    ? await prisma.certificate.findMany({
        where: { studentId: student.id },
        include: { course: true },
      })
    : [];

  const allCourses = await prisma.course.findMany({
    where: { isPublished: true },
    take: 6,
  });

  const enrolledCourses = enrollments.map((e) => ({
    ...parseCourse(e.course),
    progress: e.progress,
    paymentStatus: e.paymentStatus,
  }));

  return (
    <DashboardClient
      student={student}
      enrolledCourses={enrolledCourses}
      quizAttempts={quizAttempts}
      certificates={certificates}
      allCourses={allCourses.map(parseCourse)}
    />
  );
}

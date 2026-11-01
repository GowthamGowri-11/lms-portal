import { prisma } from '@/lib/prisma';
import AdminPaymentsClient from '@/app/admin/payments/AdminPaymentsClient';

export default async function AdminPaymentsPage() {
  const [enrollments, students] = await Promise.all([
    prisma.enrollment.findMany({
      include: {
        student: true,
        course: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    }),
    prisma.student.findMany({
      include: {
        user: true,
      },
    }),
  ]);

  // Plain objects for Client Component
  const formattedEnrollments = enrollments.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    studentName: e.student.name,
    studentEmail: e.student.email,
    courseId: e.courseId,
    courseTitle: e.course.title,
    coursePrice: e.course.discountPrice || e.course.price || 0,
    paymentStatus: e.paymentStatus,
    enrolledAt: e.enrolledAt.toISOString(),
  }));

  const formattedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar,
    username: s.user?.name || s.name,
  }));

  return (
    <AdminPaymentsClient
      enrollments={formattedEnrollments}
      students={formattedStudents}
    />
  );
}

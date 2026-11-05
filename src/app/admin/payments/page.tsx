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

  const toIso = (d: any) => {
    if (!d) return new Date().toISOString();
    if (d instanceof Date) return d.toISOString();
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  };

  // Plain objects for Client Component with safe navigations
  const formattedEnrollments = enrollments.map((e) => ({
    id: e.id,
    studentId: e.studentId,
    studentName: e.student?.name || 'Unknown Student',
    studentEmail: e.student?.email || '',
    courseId: e.courseId,
    courseTitle: e.course?.title || 'Unknown Course',
    coursePrice: e.course ? (e.course.discountPrice || e.course.price || 0) : 0,
    paymentStatus: e.paymentStatus || 'pending',
    enrolledAt: toIso(e.enrolledAt),
  }));

  const formattedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar || '',
    username: s.user?.name || s.name,
  }));

  return (
    <AdminPaymentsClient
      enrollments={formattedEnrollments}
      students={formattedStudents}
    />
  );
}

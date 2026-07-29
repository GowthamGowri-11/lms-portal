import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './StudentDashboardClient';
import { parseCourse } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect('/');
  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect('/admin');
  if (role === 'TRAINER') redirect('/dashboard/trainer');

  let student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              trainer: true,
              modules: { include: { lessons: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      },
      courseProgresses: true,
      certificates: { include: { course: true } },
      queries: { orderBy: { createdAt: 'desc' } },
      quizAttempts: {
        include: { quiz: { include: { course: true } } },
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  if (!student) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'STUDENT', isOnboarded: true },
    }).catch(() => {});

    student = await prisma.student.create({
      data: {
        userId: session.user.id,
        name: session.user.name || 'New Student',
        email: session.user.email || '',
        avatar: session.user.image || '',
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                trainer: true,
                modules: { include: { lessons: true } },
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        courseProgresses: true,
        certificates: { include: { course: true } },
        queries: { orderBy: { createdAt: 'desc' } },
        quizAttempts: {
          include: { quiz: { include: { course: true } } },
          orderBy: { completedAt: 'desc' },
        },
      },
    });
  } else if (role !== 'STUDENT') {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'STUDENT', isOnboarded: true },
    }).catch(() => {});
  }

  const enrollmentsWithParsed = student.enrollments.map((e) => ({
    ...e,
    enrolledAt: e.enrolledAt.toISOString(),
    course: parseCourse(e.course),
  }));

  const certificatesWithSerialized = student.certificates.map((c) => ({
    ...c,
    issuedAt: c.issuedAt.toISOString(),
  }));

  const queriesWithSerialized = student.queries.map((q) => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
  }));

  const quizAttemptsWithSerialized = ((student as any).quizAttempts || []).map((qa: any) => ({
    ...qa,
    completedAt: qa.completedAt ? qa.completedAt.toISOString() : null,
  }));

  let retakeRequestsWithSerialized: any[] = [];
  try {
    if ((prisma as any).quizRetakeRequest && student?.id) {
      const rrList = await (prisma as any).quizRetakeRequest.findMany({
        where: { studentId: student.id },
        orderBy: { requestedAt: 'desc' },
      });
      retakeRequestsWithSerialized = rrList.map((rr: any) => ({
        ...rr,
        requestedAt: rr.requestedAt ? rr.requestedAt.toISOString() : null,
        resolvedAt: rr.resolvedAt ? rr.resolvedAt.toISOString() : null,
      }));
    }
  } catch (e) {
    console.error('Error fetching student retake requests:', e);
  }

  return (
    <StudentDashboardClient
      student={student}
      enrollments={enrollmentsWithParsed as any}
      courseProgresses={student.courseProgresses}
      certificates={certificatesWithSerialized as any}
      queries={queriesWithSerialized as any}
      quizAttempts={quizAttemptsWithSerialized as any}
      retakeRequests={retakeRequestsWithSerialized as any}
    />
  );
}

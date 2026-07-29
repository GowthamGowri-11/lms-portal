import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TrainerDashboardClient from './TrainerDashboardClient';
import { parseCourse } from '@/lib/utils';

export default async function TrainerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect('/');
  if ((session.user as any).role !== 'TRAINER') {
    if ((session.user as any).role === 'ADMIN') redirect('/admin');
    if ((session.user as any).role === 'STUDENT') redirect('/dashboard/student');
    redirect('/');
  }

  const trainer = await prisma.trainer.findUnique({
    where: { userId: session.user.id },
    include: {
      courses: {
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: { lessons: { orderBy: { order: 'asc' } } },
          },
          quizzes: {
            include: { questions: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
          },
          enrollments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!trainer) redirect('/');

  const courseIds = trainer.courses.map((c) => c.id);
  let retakeRequests: any[] = [];
  try {
    if ((prisma as any).quizRetakeRequest) {
      retakeRequests = await (prisma as any).quizRetakeRequest.findMany({
        where: {
          status: 'PENDING',
          quiz: { courseId: { in: courseIds } },
        },
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true } },
          quiz: {
            select: {
              id: true,
              title: true,
              courseId: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      });
    }
  } catch (err) {
    console.error('Error fetching retake requests:', err);
  }


  const coursesWithParsed = trainer.courses.map((c) => ({
    ...parseCourse(c),
    modules: c.modules,
    quizzes: c.quizzes,
    enrollments: c.enrollments,
  }));

  return (
    <TrainerDashboardClient
      trainer={trainer}
      courses={coursesWithParsed as any}
      retakeRequests={retakeRequests}
    />
  );
}


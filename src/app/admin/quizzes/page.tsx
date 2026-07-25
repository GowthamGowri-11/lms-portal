import { prisma } from '@/lib/prisma';
import AdminQuizzesClient from './AdminQuizzesClient';

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      questions: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true, logo: true } },
      module: { select: { id: true, title: true } },
    },
  });

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, logo: true },
    orderBy: { title: 'asc' },
  });

  const modules = await prisma.module.findMany({
    select: { id: true, title: true, courseId: true },
    orderBy: { order: 'asc' },
  });

  return <AdminQuizzesClient quizzes={quizzes} courses={courses} modules={modules} />;
}

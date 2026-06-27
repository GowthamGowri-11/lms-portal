import { prisma } from '@/lib/prisma';
import AdminProblemsClient from './AdminProblemsClient';

export default async function AdminProblemsPage() {
  const problems = await prisma.codingProblem.findMany({
    orderBy: { createdAt: 'desc' },
    include: { lesson: { select: { id: true, title: true } } },
  });

  const lessons = await prisma.lesson.findMany({
    select: { id: true, title: true, module: { select: { course: { select: { title: true, logo: true } } } } },
    orderBy: { title: 'asc' },
  });

  return <AdminProblemsClient problems={problems} lessons={lessons} />;
}

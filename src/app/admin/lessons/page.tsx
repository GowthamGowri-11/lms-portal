import { prisma } from '@/lib/prisma';
import AdminLessonsClient from './AdminLessonsClient';

export default async function AdminLessonsPage() {
  const modules = await prisma.module.findMany({
    orderBy: [{ course: { title: 'asc' } }, { order: 'asc' }],
    include: {
      course: { select: { id: true, title: true, logo: true } },
      lessons: { orderBy: { order: 'asc' } },
    },
  });

  return <AdminLessonsClient modules={modules} />;
}

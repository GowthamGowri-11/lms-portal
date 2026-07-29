import { prisma } from '@/lib/prisma';
import AdminLessonsClient from './AdminLessonsClient';

export default async function AdminLessonsPage() {
  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
      },
    },
  });

  return <AdminLessonsClient courses={courses} />;
}

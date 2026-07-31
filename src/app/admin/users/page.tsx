import { prisma } from '@/lib/prisma';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        include: {
          enrollments: true,
        },
      },
    },
  });

  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
  });
  
  return <AdminUsersClient initialUsers={users} courses={courses} />;
}

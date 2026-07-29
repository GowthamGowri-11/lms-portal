import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AdminQueriesClient from '@/app/admin/queries/AdminQueriesClient';

export default async function AdminQueriesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!user || user.role !== 'ADMIN') redirect('/');

  const queries = await prisma.studentQuery.findMany({
    include: { student: true },
    orderBy: { createdAt: 'desc' },
  });

  const serializedQueries = queries.map((q) => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
  }));

  return <AdminQueriesClient queries={serializedQueries} />;
}

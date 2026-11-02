import AdminShell from '@/components/admin/AdminShell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}

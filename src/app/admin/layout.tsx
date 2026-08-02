import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';
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

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}

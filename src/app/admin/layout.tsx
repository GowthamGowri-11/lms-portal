import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}

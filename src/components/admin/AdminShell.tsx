'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import AdminSidebar from './AdminSidebar';
import styles from '@/app/admin/layout.module.css';

interface AdminSidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export const useAdminSidebar = () => useContext(AdminSidebarContext);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('atlyx_admin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('atlyx_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <AdminSidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapsed: handleToggle,
      }}
    >
      <div className={styles.adminLayout}>
        <AdminSidebar collapsed={collapsed} onToggleCollapse={handleToggle} />
        <main
          className={`${styles.adminMain} ${collapsed ? styles.mainCollapsed : ''}`}
        >
          {children}
        </main>
      </div>
    </AdminSidebarContext.Provider>
  );
}

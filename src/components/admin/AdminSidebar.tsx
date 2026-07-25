'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Home,
  Code,
  LogOut,
  PlayCircle,
  HelpCircle,
  UserCircle,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/lessons', label: 'Lessons', icon: PlayCircle },
  { href: '/admin/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/admin/problems', label: 'Coding Problems', icon: Code },
  { href: '/admin/trainers', label: 'Trainers', icon: Users },
  { href: '/admin/students', label: 'Students', icon: GraduationCap },
  { href: '/admin/developers', label: 'Developers', icon: UserCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin" className={styles.logo}>
          <div className={styles.logoIcon}>
            <GraduationCap size={24} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className={styles.logoText}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                GM Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {isActive && (
                <motion.div
                  className={styles.activeBg}
                  layoutId="adminActiveNav"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={20} className={styles.navIcon} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className={styles.navLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/" className={styles.footerLink}>
          <Home size={20} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Back to Site
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button className={styles.footerLink}>
          <LogOut size={20} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

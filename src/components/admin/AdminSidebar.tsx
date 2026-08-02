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
  CircleHelp,
  UserCircle,
  MessageSquare,
  CreditCard,
  Menu,
  X,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users Access', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/lessons', label: 'Lessons', icon: PlayCircle },
  { href: '/admin/quizzes', label: 'Quizzes', icon: CircleHelp },
  { href: '/admin/problems', label: 'Coding Problems', icon: Code },
  { href: '/admin/trainers', label: 'Trainers', icon: Users },
  { href: '/admin/students', label: 'Students', icon: GraduationCap },
  { href: '/admin/developers', label: 'Developers', icon: UserCircle },
  { href: '/admin/requests', label: 'Requests', icon: Users },
  { href: '/admin/queries', label: 'Student Queries', icon: MessageSquare },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <Link href="/admin" className={styles.logo}>
          <div className={styles.logoIcon} style={{ background: 'var(--accent-primary)' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span className={styles.logoText}>ATLYX Admin</span>
        </Link>

        <button
          className={styles.hamburgerBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close admin navigation' : 'Open admin navigation'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className={styles.header}>
          <Link href="/admin" className={styles.logo} onClick={handleNavClick}>
            <div className={styles.logoIcon} style={{ background: 'var(--accent-primary)' }}>
              <GraduationCap size={24} color="white" />
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
                  ATLYX Admin
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar desktop width"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={styles.nav} aria-label="Admin navigation menu">
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
                onClick={handleNavClick}
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
                  {(!collapsed || mobileOpen) && (
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
          <Link href="/" className={styles.footerLink} onClick={handleNavClick}>
            <Home size={20} />
            <AnimatePresence>
              {(!collapsed || mobileOpen) && (
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
          <button className={styles.footerLink} onClick={handleNavClick}>
            <LogOut size={20} />
            <AnimatePresence>
              {(!collapsed || mobileOpen) && (
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
    </>
  );
}

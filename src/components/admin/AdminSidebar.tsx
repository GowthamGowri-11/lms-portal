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
  ShieldAlert,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import BrandLogo from '@/components/ui/BrandLogo';
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
  { href: '/admin/requests', label: 'Requests', icon: ShieldAlert },
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
          <BrandLogo size={28} />
          <span className={styles.brandTitle} style={{ fontSize: '1.15rem' }}>ATLYX</span>
          <span className={styles.adminBadge}>Admin Hub</span>
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
        animate={{ width: collapsed ? 76 : 270 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className={styles.header}>
          <Link href="/admin" className={styles.logo} onClick={handleNavClick}>
            <BrandLogo size={collapsed ? 28 : 30} />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className={styles.logoTextWrap}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className={styles.brandTitle}>ATLYX</span>
                  <span className={styles.adminBadge}>Admin Hub</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar desktop width"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={2.5} />
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
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    className={styles.activeBg}
                    layoutId="adminActiveNav"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className={styles.navIcon} />
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
          <Link href="/" className={styles.footerLink} onClick={handleNavClick} title={collapsed ? 'Back to Site' : undefined}>
            <Home size={18} />
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
          <button
            onClick={() => {
              handleNavClick();
              signOut({ callbackUrl: '/' });
            }}
            className={`${styles.footerLink} ${styles.logoutBtn}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
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

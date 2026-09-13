'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { openAuthModal } from '@/lib/auth-modal-events';
import BrandLogo from '@/components/ui/BrandLogo';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/trainers', label: 'Trainers' },
    { href: '/about', label: 'About Us' },
  ];

  return (
    <header
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <BrandLogo size={32} />
          <span className={styles.logoText}>
            <span>ATLYX</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className={styles.rightActions}>
          {status === 'loading' ? (
            <div className={styles.adminBtn}>...</div>
          ) : session ? (
            <>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className={styles.adminBtn}>
                  <LayoutDashboard size={18} />
                  <span>Admin</span>
                </Link>
              )}
              {session.user?.role === 'STUDENT' && (
                <Link href="/dashboard/student" className={styles.adminBtn}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              )}
              {session.user?.role === 'TRAINER' && (
                <Link href="/dashboard/trainer" className={styles.adminBtn}>
                  <LayoutDashboard size={18} />
                  <span>Trainer Area</span>
                </Link>
              )}
              <button onClick={() => signOut()} className={styles.adminBtn}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                padding: '8px 20px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.88rem',
                letterSpacing: '0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.borderColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}


          <button
            className={styles.mobileToggle}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className={styles.mobileLink} onClick={() => setIsMobileOpen(false)}>
                Admin Panel
              </Link>
            )}
            {session ? (
              <button onClick={() => { signOut(); setIsMobileOpen(false); }} className={styles.mobileLink} style={{ textAlign: 'left' }}>
                Logout
              </button>
            ) : (
              <button onClick={() => { signIn('google'); setIsMobileOpen(false); }} className={styles.mobileLink} style={{ textAlign: 'left' }}>
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

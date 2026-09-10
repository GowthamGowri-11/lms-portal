'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.brandLink}>
              <BrandLogo size={28} />
              <h3>ATLYX</h3>
            </Link>
            <p>
              Empowering learners worldwide with premium, expert-led courses
              designed for the real world.
            </p>
          </div>

          {/* Column 1: Navigation Links (Left side on mobile) */}
          <div className={styles.footerLinks}>
            <h4>Navigation</h4>
            <Link href="/">Home</Link>
            <Link href="/courses">Courses</Link>
            <Link href="/trainers">Trainers</Link>
            <Link href="/about">About Us</Link>
            <Link href="/admin">Admin Panel</Link>
          </div>

          {/* Column 2: Contact (Right side on mobile) */}
          <div className={styles.footerLinks}>
            <h4>Contact</h4>
            <a href="mailto:kit28.24bad049@gmail.com">kit28.24bad049@gmail.com</a>
            <a href="tel:8015450751">8015450751</a>
          </div>
        </div>

        {/* Clean Bottom Bar without placeholder legal links */}
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} ATLYX. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

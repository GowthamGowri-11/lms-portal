'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { getCourseVisual } from '@/lib/courseImages';
import styles from './CourseBanner.module.css';

interface CourseBannerProps {
  category?: string;
  title?: string;
  level?: string;
  rating?: number | string;
  learnerCount?: number | string;
  logo?: string | null;
  className?: string;
}

export default function CourseBanner({
  category = 'General',
  title = '',
  level = 'Beginner',
  rating = '4.8',
  learnerCount = '500',
  logo,
  className = '',
}: CourseBannerProps) {
  const visual = getCourseVisual(category, title, logo);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`${styles.bannerContainer} ${className}`}
      style={{ background: visual.gradient }}
    >
      {/* Visual Artwork Image */}
      {!imgError && (
        <img
          src={visual.imageSrc}
          alt={`${title} course artwork`}
          className={styles.bannerImage}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Ambient Gradient Shade for badge readability */}
      <div className={styles.bannerGradientShade} />

      {/* Top Row: Category Tech Badge & Frosted Rating */}
      <div className={styles.bannerTopRow}>
        <div className={styles.floatingTechBadge}>
          <span className={styles.techEmoji}>{visual.icon}</span>
          <span className={styles.categoryName}>{category}</span>
        </div>

        <div className={styles.ratingFrostedPill}>
          <Star size={11} className={styles.starIconGold} />
          <span className={styles.ratingScore}>{rating}</span>
          <span className={styles.ratingCount}>({learnerCount}+)</span>
        </div>
      </div>

      {/* Bottom Row: Level Pill & Accredited Chip */}
      <div className={styles.bannerBottomRow}>
        <span className={styles.levelPill}>{level}</span>
        <span className={styles.accreditedTag}>
          <ShieldCheck size={11} /> Accredited
        </span>
      </div>
    </div>
  );
}

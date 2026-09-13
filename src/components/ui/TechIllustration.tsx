'use client';

import React from 'react';
import { getCourseVisual } from '@/lib/courseImages';

export interface TechIllustrationProps {
  title: string;
  category: string;
  size?: number;
  className?: string;
}

export default function TechIllustration({
  title,
  category,
  size = 110,
  className = '',
}: TechIllustrationProps) {
  const visual = getCourseVisual(category, title);

  return (
    <div
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${Math.round(size * 0.65)}px` : 'auto',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        background: visual.gradient,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
      }}
    >
      <img
        src={visual.imageSrc}
        alt={`${title} artwork`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        loading="lazy"
      />
    </div>
  );
}

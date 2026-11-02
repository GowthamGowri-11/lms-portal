'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './CursorEffect.module.css';

export default function CursorEffect() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Track hover on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('[role="button"]') ||
          target.closest('.interactive-hover') ||
          target.closest('summary'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    // Smooth RAF loop for 60fps interpolation
    let animationFrameId: number;
    const render = () => {
      // Fast lerp for dot (inner cursor)
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.45;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.45;

      // Slower fluid lerp for ambient glow aura
      glowPos.current.x += (mousePos.current.x - glowPos.current.x) * 0.12;
      glowPos.current.y += (mousePos.current.y - glowPos.current.y) * 0.12;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }

      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate3d(${glowPos.current.x}px, ${glowPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <div
      className={`${styles.cursorContainer} ${isVisible ? styles.visible : ''}`}
      aria-hidden="true"
    >
      {/* 1. Fluid Ambient Spotlight Glow */}
      <div
        ref={cursorGlowRef}
        className={`${styles.cursorGlow} ${isHovered ? styles.glowExpanded : ''}`}
      />

      {/* 2. Precision Interactive Ring / Dot */}
      <div
        ref={cursorDotRef}
        className={`${styles.cursorRing} ${isHovered ? styles.ringHovered : ''}`}
      >
        <span className={styles.cursorCenterDot} />
      </div>
    </div>
  );
}

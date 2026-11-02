'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// ----- Fade In Up -----
export function FadeInUp({
  children,
  delay = 0,
  duration = 0.45,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `motionFadeInUp ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Fade In -----
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `motionFadeIn ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Scale In -----
export function ScaleIn({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `motionScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Slide In From Left -----
export function SlideInLeft({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `motionSlideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Slide In From Right -----
export function SlideInRight({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `motionSlideInRight 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Stagger Container -----
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    },
  },
};

export function StaggerContainer({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        animation: 'motionFadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ----- Scroll Reveal -----
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ----- Modal Animation -----
export function ModalAnimation({
  children,
  isOpen,
}: {
  children: ReactNode;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ----- Hover Scale -----
export function HoverScale({
  children,
  scale = 1.02,
  className = '',
}: {
  children: ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ----- Page Transition -----
export function PageTransition({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// ----- Floating Animation -----
export function FloatingElement({
  children,
  className = '',
  duration = 3,
  distance = 10,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ----- Counter Animation -----
export function AnimatedCounter({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={value}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

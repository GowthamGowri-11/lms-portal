'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'framer-motion';

interface TiltCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export default function TiltCard({ children, style, ...props }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Max tilt angle (Increased for more dramatic 3D effect)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['35deg', '-35deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-35deg', '35deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import defaultAnimationData from './lottieData.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type Props = {
  width?: number | string;
  height?: number | string;
  className?: string;
  animationData?: unknown;
};

export default function LottieAnimation({ width = 240, height = 240, className, animationData: customData }: Props) {
  const [animationData] = useState<unknown>(customData || defaultAnimationData);

  if (!animationData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
        <div className="animate-pulse" style={{ width: '60%', height: '60%', borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
      </div>
    );
  }

  return (
    <div style={{ width, height, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <Lottie animationData={animationData} loop={true} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}


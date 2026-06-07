'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import defaultAnimationData from './lottieData.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function LottieAnimation() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Using a local simple lottie animation to avoid CORS or fetch errors
    setAnimationData(defaultAnimationData);
  }, []);

  if (!animationData) {
    return (
      <div style={{ width: 400, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse" style={{ width: 200, height: 200, borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
      </div>
    );
  }

  return (
    <div style={{ width: 400, height: 400, margin: '0 auto' }}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}

import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({ size = 32, className = '', showText = false }: BrandLogoProps) {
  return (
    <div className={`brand-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Main Cyan-to-Blue-to-Purple Gradient */}
          <linearGradient id="atlyxGradMain" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="35%" stopColor="#0072ff" />
            <stop offset="75%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Right Leg Gradient */}
          <linearGradient id="atlyxGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Inner Shadow / 3D Bevel Gradient */}
          <linearGradient id="atlyxBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0072ff" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Right Lower Foot of 'A' */}
        <path
          d="M 62 64 L 70 80 L 82 78 L 73 60 Z"
          fill="url(#atlyxGradRight)"
          style={{ opacity: 0.95 }}
        />

        {/* Dynamic 3D Main 'A' Shape with Angled Cross-Slash */}
        <path
          d="M 48 16 L 56 16 L 39 50 L 51 50 L 38 86 L 18 80 L 38 42 L 28 42 Z"
          fill="url(#atlyxGradMain)"
          filter="url(#logoGlow)"
        />

        {/* Dynamic Flying Check Slash cutting through 'A' */}
        <path
          d="M 38 86 L 50 62 L 88 42 L 51 50 L 38 86 Z"
          fill="url(#atlyxGradMain)"
        />

        {/* Stylized Sharp 'A' geometric polygon matching user logo */}
        <path
          d="M 44 18 C 46 14 52 14 54 18 L 64 36 L 51 43 L 48 37 L 36 61 L 49 61 L 39 85 L 18 80 L 44 18 Z"
          fill="url(#atlyxGradMain)"
        />
        
        {/* Dynamic Swoosh Overlay */}
        <path
          d="M 49 61 L 89 42 L 54 52 L 39 85 Z"
          fill="url(#atlyxGradMain)"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            fontWeight: 800,
            fontSize: `${size * 0.65}px`,
            letterSpacing: '0.04em',
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          ATLYX
        </span>
      )}
    </div>
  );
}

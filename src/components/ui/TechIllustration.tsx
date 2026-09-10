'use client';

import React from 'react';

type TechKey =
  | 'python'
  | 'java'
  | 'cpp'
  | 'react'
  | 'node'
  | 'javascript'
  | 'html'
  | 'css'
  | 'mongodb'
  | 'sql'
  | 'default';

interface TechConfig {
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  renderCenter: () => React.ReactNode;
}

function getTechConfig(title: string, category: string): TechConfig {
  const t = (title + ' ' + category).toLowerCase();

  if (t.includes('python')) {
    return {
      gradientStart: '#3b82f6',
      gradientEnd: '#eab308',
      glow: '#3b82f6',
      renderCenter: () => (
        <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="system-ui, sans-serif">
          Py
        </text>
      ),
    };
  }

  if (t.includes('java') && !t.includes('javascript')) {
    return {
      gradientStart: '#f97316',
      gradientEnd: '#ef4444',
      glow: '#f97316',
      renderCenter: () => (
        <text x="50" y="60" textAnchor="middle" fill="#ffffff" fontSize="36" fontWeight="bold" fontFamily="system-ui, sans-serif">
          J
        </text>
      ),
    };
  }

  if (t.includes('c++') || t.includes('cpp')) {
    return {
      gradientStart: '#06b6d4',
      gradientEnd: '#3b82f6',
      glow: '#06b6d4',
      renderCenter: () => (
        <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold" fontFamily="system-ui, sans-serif">
          C++
        </text>
      ),
    };
  }

  if (t.includes('react')) {
    return {
      gradientStart: '#06b6d4',
      gradientEnd: '#0284c7',
      glow: '#06b6d4',
      renderCenter: () => (
        <g stroke="#ffffff" strokeWidth="2.5" fill="none">
          <ellipse cx="50" cy="50" rx="20" ry="8" />
          <ellipse cx="50" cy="50" rx="20" ry="8" transform="rotate(60 50 50)" />
          <ellipse cx="50" cy="50" rx="20" ry="8" transform="rotate(120 50 50)" />
          <circle cx="50" cy="50" r="4" fill="#ffffff" stroke="none" />
        </g>
      ),
    };
  }

  if (t.includes('node') || t.includes('express')) {
    return {
      gradientStart: '#22c55e',
      gradientEnd: '#15803d',
      glow: '#22c55e',
      renderCenter: () => (
        <g>
          <polygon points="50,26 70,37.5 70,62.5 50,74 30,62.5 30,37.5" fill="none" stroke="#ffffff" strokeWidth="3" />
          <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold" fontFamily="system-ui, sans-serif">
            N
          </text>
        </g>
      ),
    };
  }

  if (t.includes('javascript') || t.includes('js')) {
    return {
      gradientStart: '#eab308',
      gradientEnd: '#ca8a04',
      glow: '#eab308',
      renderCenter: () => (
        <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="bold" fontFamily="system-ui, sans-serif">
          JS
        </text>
      ),
    };
  }

  if (t.includes('html')) {
    return {
      gradientStart: '#f97316',
      gradientEnd: '#c2410c',
      glow: '#f97316',
      renderCenter: () => (
        <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="system-ui, sans-serif">
          HTML
        </text>
      ),
    };
  }

  if (t.includes('css')) {
    return {
      gradientStart: '#3b82f6',
      gradientEnd: '#1d4ed8',
      glow: '#3b82f6',
      renderCenter: () => (
        <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="system-ui, sans-serif">
          CSS
        </text>
      ),
    };
  }

  if (t.includes('mongo')) {
    return {
      gradientStart: '#22c55e',
      gradientEnd: '#166534',
      glow: '#22c55e',
      renderCenter: () => (
        <path
          d="M50 26 C42 38 42 54 50 74 C58 54 58 38 50 26 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      ),
    };
  }

  if (t.includes('sql') || t.includes('data') || t.includes('database')) {
    return {
      gradientStart: '#a855f7',
      gradientEnd: '#6b21a8',
      glow: '#a855f7',
      renderCenter: () => (
        <g stroke="#ffffff" strokeWidth="2.5" fill="none">
          <ellipse cx="50" cy="35" rx="18" ry="6" />
          <path d="M32 35 v15 c0 3.3 8 6 18 6 s18 -2.7 18 -6 v-15" />
          <path d="M32 50 v15 c0 3.3 8 6 18 6 s18 -2.7 18 -6 v-15" />
        </g>
      ),
    };
  }

  return {
    gradientStart: '#6366f1',
    gradientEnd: '#4338ca',
    glow: '#6366f1',
    renderCenter: () => (
      <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="bold" fontFamily="system-ui, sans-serif">
        Code
      </text>
    ),
  };
}

export default function TechOrbIcon({ title, category, size = 110 }: TechOrbIconProps) {
  const t = (title + ' ' + category).toLowerCase();
  const isCpp = t.includes('c++') || t.includes('cpp');

  if (isCpp) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <img
          src="/cpp-logo.png"
          alt="C++ Logo"
          style={{
            width: '92%',
            height: '92%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 16px rgba(0, 89, 156, 0.16))',
            animation: 'floatingOrb 4s ease-in-out infinite',
          }}
        />
        <style jsx global>{`
          @keyframes floatingOrb {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-6px);
            }
          }
        `}</style>
      </div>
    );
  }

  const config = getTechConfig(title, category);
  const cleanId = (title + '-' + category).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible',
          animation: 'floatingOrb 4s ease-in-out infinite',
          willChange: 'transform',
        }}
      >
        <defs>
          {/* Gradient Orb */}
          <radialGradient id={`orb-grad-${cleanId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={config.gradientStart} stopOpacity="1" />
            <stop offset="100%" stopColor={config.gradientEnd} stopOpacity="0.8" />
          </radialGradient>

          {/* Soft Glow */}
          <filter id={`orb-glow-${cleanId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft Glowing Gradient Orb Behind Glass */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill={`url(#orb-grad-${cleanId})`}
          filter={`url(#orb-glow-${cleanId})`}
          style={{
            animation: 'softPulse 3s ease-in-out infinite alternate',
            willChange: 'transform, opacity',
          }}
        />

        {/* Frosted Glass Circular Icon Container (Glassmorphism) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="rgba(255, 255, 255, 0.12)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />

        {/* Center Technology Icon / Text */}
        {config.renderCenter()}

        {/* Floating Particles */}
        <circle cx="22" cy="30" r="1.8" fill="#ffffff" opacity="0.7" style={{ animation: 'particleMove1 3s ease-in-out infinite' }} />
        <circle cx="78" cy="28" r="1.5" fill="#ffffff" opacity="0.6" style={{ animation: 'particleMove2 3.5s ease-in-out infinite' }} />
        <circle cx="26" cy="72" r="1.2" fill="#ffffff" opacity="0.5" style={{ animation: 'particleMove2 4s ease-in-out infinite' }} />
        <circle cx="74" cy="70" r="1.6" fill="#ffffff" opacity="0.8" style={{ animation: 'particleMove1 3.2s ease-in-out infinite' }} />
      </svg>

      <style jsx global>{`
        @keyframes floatingOrb {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes softPulse {
          0% {
            opacity: 0.85;
            transform: scale(0.97);
          }
          100% {
            opacity: 1;
            transform: scale(1.03);
          }
        }
        @keyframes particleMove1 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.4;
          }
          50% {
            transform: translate(-3px, -4px);
            opacity: 0.9;
          }
        }
        @keyframes particleMove2 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(4px, -3px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

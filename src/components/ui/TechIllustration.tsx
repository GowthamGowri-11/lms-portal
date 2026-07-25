'use client';

import React from 'react';

// Maps category/title keywords to a theme config
function getTechTheme(title: string, category: string) {
  const t = (title + ' ' + category).toLowerCase();

  if (t.includes('python'))
    return { color1: '#3b82f6', color2: '#eab308', glow: '#3b82f6', type: 'python' };
  if (t.includes('java') && !t.includes('javascript'))
    return { color1: '#22c55e', color2: '#16a34a', glow: '#22c55e', type: 'java' };
  if (t.includes('react'))
    return { color1: '#f97316', color2: '#fb923c', glow: '#f97316', type: 'react' };
  if (t.includes('node') || t.includes('express'))
    return { color1: '#a855f7', color2: '#7c3aed', glow: '#a855f7', type: 'node' };
  if (t.includes('angular'))
    return { color1: '#ef4444', color2: '#dc2626', glow: '#ef4444', type: 'angular' };
  if (t.includes('vue'))
    return { color1: '#10b981', color2: '#059669', glow: '#10b981', type: 'vue' };
  if (t.includes('c++') || t.includes('cpp'))
    return { color1: '#06b6d4', color2: '#0891b2', glow: '#06b6d4', type: 'cpp' };
  if (t.includes('typescript') || t.includes(' ts '))
    return { color1: '#3b82f6', color2: '#1d4ed8', glow: '#3b82f6', type: 'typescript' };
  if (t.includes('frontend') || t.includes('html') || t.includes('css'))
    return { color1: '#f97316', color2: '#ea580c', glow: '#f97316', type: 'html' };
  if (t.includes('backend'))
    return { color1: '#22c55e', color2: '#16a34a', glow: '#22c55e', type: 'backend' };
  if (t.includes('data') || t.includes('pandas') || t.includes('numpy'))
    return { color1: '#06b6d4', color2: '#0284c7', glow: '#06b6d4', type: 'data' };
  if (t.includes('cloud') || t.includes('aws') || t.includes('devops'))
    return { color1: '#f59e0b', color2: '#d97706', glow: '#f59e0b', type: 'cloud' };
  if (t.includes('django') || t.includes('flask'))
    return { color1: '#10b981', color2: '#059669', glow: '#10b981', type: 'django' };

  return { color1: '#6366f1', color2: '#4f46e5', glow: '#6366f1', type: 'default' };
}

// Individual SVG logo paths
function LogoSVG({ type, color1, color2 }: { type: string; color1: string; color2: string }) {
  switch (type) {
    case 'python':
      return (
        <g>
          {/* Python snake body — simplified iconic path */}
          <path d="M20 8 C20 4 23 2 28 2 L36 2 C40 2 42 4 42 8 L42 16 C42 20 40 22 36 22 L28 22 C24 22 20 24 20 28 L20 36 C20 40 22 42 26 42 L34 42 C38 42 40 40 40 36"
            fill="none" stroke={color1} strokeWidth="5" strokeLinecap="round" />
          <path d="M40 32 C40 36 37 38 32 38 L24 38 C20 38 18 36 18 32 L18 24 C18 20 20 18 24 18 L32 18 C36 18 40 16 40 12 L40 4 C40 0 38 -2 34 -2 L26 -2 C22 -2 20 0 20 4"
            fill="none" stroke={color2} strokeWidth="5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="30" cy="10" r="2.5" fill={color1} />
          <circle cx="30" cy="34" r="2.5" fill={color2} />
        </g>
      );

    case 'java':
      return (
        <g>
          {/* Java coffee cup */}
          <path d="M15 8 Q18 20 22 28 Q26 36 28 40 Q32 48 28 52"
            fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" />
          <path d="M25 8 Q28 16 30 24 Q32 32 30 40 Q28 46 26 50"
            fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M35 8 Q32 16 30 24"
            fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          {/* Cup */}
          <path d="M10 30 L14 52 Q16 58 20 58 L40 58 Q44 58 46 52 L50 30 Z"
            fill="none" stroke={color2} strokeWidth="3.5" />
          {/* Handle */}
          <path d="M46 36 Q56 36 56 44 Q56 52 46 52"
            fill="none" stroke={color2} strokeWidth="3.5" strokeLinecap="round" />
          {/* Saucer */}
          <ellipse cx="30" cy="61" rx="22" ry="4" fill="none" stroke={color2} strokeWidth="3" />
        </g>
      );

    case 'react':
      return (
        <g>
          {/* React atom orbits */}
          <ellipse cx="30" cy="30" rx="24" ry="9" fill="none" stroke={color1} strokeWidth="3" opacity="0.9" />
          <ellipse cx="30" cy="30" rx="24" ry="9" fill="none" stroke={color1} strokeWidth="3" opacity="0.9"
            transform="rotate(60 30 30)" />
          <ellipse cx="30" cy="30" rx="24" ry="9" fill="none" stroke={color1} strokeWidth="3" opacity="0.9"
            transform="rotate(-60 30 30)" />
          {/* Nucleus */}
          <circle cx="30" cy="30" r="5" fill={color2} />
          <circle cx="30" cy="30" r="3" fill={color1} />
        </g>
      );

    case 'node':
      return (
        <g>
          {/* Node.js hexagon + text style */}
          <path d="M30 4 L52 17 L52 43 L30 56 L8 43 L8 17 Z"
            fill="none" stroke={color1} strokeWidth="3.5" />
          <path d="M30 12 L46 21 L46 39 L30 48 L14 39 L14 21 Z"
            fill={color1} opacity="0.15" />
          {/* N letter stylized */}
          <path d="M18 22 L18 38 L30 22 L30 38" fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 38 L34 22 L42 38 L42 22" fill="none" stroke={color2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );

    case 'angular':
      return (
        <g>
          <polygon points="30,4 56,14 52,46 30,58 8,46 4,14" fill="none" stroke={color1} strokeWidth="3.5" />
          <polygon points="30,12 48,18 44,44 30,50 16,44 12,18" fill={color1} opacity="0.12" />
          <path d="M18 42 L30 16 L42 42" fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 34 L38 34" stroke={color1} strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'vue':
      return (
        <g>
          <path d="M4 8 L30 54 L56 8 L44 8 L30 34 L16 8 Z" fill={color1} opacity="0.9" />
          <path d="M12 8 L30 42 L48 8 L38 8 L30 26 L22 8 Z" fill={color2} opacity="0.7" />
        </g>
      );

    case 'cpp':
      return (
        <g>
          <circle cx="30" cy="30" r="24" fill="none" stroke={color1} strokeWidth="3.5" />
          <text x="30" y="36" textAnchor="middle" fill={color1} fontSize="20" fontWeight="900" fontFamily="monospace">C++</text>
        </g>
      );

    case 'typescript':
      return (
        <g>
          <rect x="6" y="6" width="48" height="48" rx="8" fill={color1} opacity="0.15" />
          <rect x="6" y="6" width="48" height="48" rx="8" fill="none" stroke={color1} strokeWidth="3" />
          <text x="30" y="39" textAnchor="middle" fill={color1} fontSize="22" fontWeight="900" fontFamily="monospace">TS</text>
        </g>
      );

    case 'html':
      return (
        <g>
          {/* HTML5 shield */}
          <path d="M8 6 L52 6 L48 52 L30 58 L12 52 Z" fill={color1} opacity="0.15" />
          <path d="M8 6 L52 6 L48 52 L30 58 L12 52 Z" fill="none" stroke={color1} strokeWidth="3.5" />
          <text x="30" y="36" textAnchor="middle" fill={color1} fontSize="16" fontWeight="900" fontFamily="monospace">HTML</text>
          <text x="30" y="50" textAnchor="middle" fill={color2} fontSize="11" fontWeight="700" fontFamily="monospace">CSS JS</text>
        </g>
      );

    case 'django':
    case 'backend':
      return (
        <g>
          <rect x="8" y="10" width="44" height="40" rx="6" fill="none" stroke={color1} strokeWidth="3.5" />
          <path d="M8 22 L52 22" stroke={color1} strokeWidth="2.5" opacity="0.6" />
          <circle cx="18" cy="16" r="3" fill={color1} opacity="0.7" />
          <circle cx="26" cy="16" r="3" fill={color2} opacity="0.7" />
          <circle cx="34" cy="16" r="3" fill={color1} opacity="0.4" />
          <rect x="14" y="30" width="16" height="3" rx="1.5" fill={color1} opacity="0.6" />
          <rect x="14" y="37" width="24" height="3" rx="1.5" fill={color2} opacity="0.5" />
          <rect x="14" y="44" width="12" height="3" rx="1.5" fill={color1} opacity="0.4" />
        </g>
      );

    case 'data':
      return (
        <g>
          <path d="M8 48 L20 28 L30 38 L40 18 L52 28" fill="none" stroke={color1} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="48" r="3.5" fill={color1} />
          <circle cx="20" cy="28" r="3.5" fill={color1} />
          <circle cx="30" cy="38" r="3.5" fill={color2} />
          <circle cx="40" cy="18" r="3.5" fill={color1} />
          <circle cx="52" cy="28" r="3.5" fill={color1} />
          <path d="M8 54 L52 54" stroke={color2} strokeWidth="2.5" opacity="0.5" />
          <path d="M8 14 L8 54" stroke={color2} strokeWidth="2.5" opacity="0.5" />
        </g>
      );

    case 'cloud':
      return (
        <g>
          <path d="M14 42 Q6 42 6 34 Q6 26 14 26 Q14 14 26 14 Q34 14 36 22 Q42 20 46 26 Q52 26 52 34 Q52 42 44 42 Z"
            fill="none" stroke={color1} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M22 42 L22 52 M30 42 L30 54 M38 42 L38 52"
            stroke={color2} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="22" cy="56" r="3" fill={color2} />
          <circle cx="30" cy="58" r="3" fill={color2} />
          <circle cx="38" cy="56" r="3" fill={color2} />
        </g>
      );

    default:
      return (
        <g>
          <circle cx="30" cy="30" r="22" fill="none" stroke={color1} strokeWidth="3.5" />
          <circle cx="30" cy="30" r="14" fill="none" stroke={color2} strokeWidth="2.5" opacity="0.7" />
          <circle cx="30" cy="30" r="6" fill={color1} opacity="0.8" />
          <path d="M30 8 L30 52 M8 30 L52 30" stroke={color1} strokeWidth="2" opacity="0.3" />
        </g>
      );
  }
}

// Floating particles
function Particles({ color }: { color: string }) {
  const particles = [
    { cx: 72, cy: 18, r: 1.8, opacity: 0.7, animDelay: '0s' },
    { cx: 85, cy: 30, r: 1.2, opacity: 0.5, animDelay: '0.4s' },
    { cx: 60, cy: 25, r: 1.5, opacity: 0.6, animDelay: '0.8s' },
    { cx: 78, cy: 45, r: 1, opacity: 0.4, animDelay: '1.2s' },
    { cx: 65, cy: 55, r: 1.8, opacity: 0.6, animDelay: '0.2s' },
    { cx: 88, cy: 60, r: 1.2, opacity: 0.5, animDelay: '1s' },
    { cx: 55, cy: 40, r: 1, opacity: 0.4, animDelay: '0.6s' },
    { cx: 93, cy: 42, r: 1.5, opacity: 0.5, animDelay: '1.4s' },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={color}
          opacity={p.opacity}
          style={{
            animation: `particleFloat 3s ease-in-out infinite`,
            animationDelay: p.animDelay,
          }}
        />
      ))}
    </>
  );
}

// Vertical light rays
function LightRays({ color }: { color: string }) {
  return (
    <>
      <line x1="74" y1="10" x2="74" y2="68" stroke={color} strokeWidth="1" opacity="0.12" />
      <line x1="80" y1="8" x2="80" y2="70" stroke={color} strokeWidth="0.8" opacity="0.08" />
      <line x1="68" y1="12" x2="68" y2="66" stroke={color} strokeWidth="0.8" opacity="0.08" />
      <line x1="86" y1="15" x2="86" y2="65" stroke={color} strokeWidth="0.6" opacity="0.06" />
    </>
  );
}

interface TechIllustrationProps {
  title: string;
  category: string;
  size?: number;
}

export default function TechIllustration({ title, category, size = 100 }: TechIllustrationProps) {
  const theme = getTechTheme(title, category);
  // Deterministic ID based on title and category to avoid hydration mismatches
  const sanitizedTitle = title.replace(/\s+/g, '-').toLowerCase();
  const sanitizedCategory = category.replace(/\s+/g, '-').toLowerCase();
  const id = `tech-${theme.type}-${sanitizedTitle}-${sanitizedCategory}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* Radial glow gradient */}
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.glow} stopOpacity="0.35" />
          <stop offset="60%" stopColor={theme.glow} stopOpacity="0.08" />
          <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>

        {/* Platform ring gradient */}
        <radialGradient id={`ring-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor={theme.glow} stopOpacity="0" />
          <stop offset="75%" stopColor={theme.glow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>

        {/* Vertical rays gradient */}
        <linearGradient id={`ray-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.glow} stopOpacity="0" />
          <stop offset="40%" stopColor={theme.glow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={theme.glow} stopOpacity="0" />
        </linearGradient>

        {/* Bloom filter */}
        <filter id={`bloom-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft outer glow filter */}
        <filter id={`glow-filter-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background radial glow */}
      <ellipse cx="50" cy="50" rx="46" ry="46"
        fill={`url(#glow-${id})`}
        style={{ animation: 'glowPulse 3s ease-in-out infinite' }}
      />

      {/* Vertical light rays */}
      <rect x="44" y="10" width="4" height="55" fill={`url(#ray-${id})`} rx="2" opacity="0.6" />
      <rect x="38" y="15" width="2.5" height="48" fill={`url(#ray-${id})`} rx="1" opacity="0.3" />
      <rect x="55" y="15" width="2.5" height="48" fill={`url(#ray-${id})`} rx="1" opacity="0.3" />

      {/* Floating particles */}
      <Particles color={theme.glow} />

      {/* Main logo with bloom */}
      <g transform="translate(20, 12) scale(1)" filter={`url(#bloom-${id})`}>
        <LogoSVG type={theme.type} color1={theme.color1} color2={theme.color2} />
      </g>

      {/* Holographic platform ring */}
      <g style={{ animation: 'platformPulse 2.5s ease-in-out infinite' }}>
        {/* Outer glow ring */}
        <ellipse cx="50" cy="78" rx="34" ry="7"
          fill={`url(#ring-${id})`}
          filter={`url(#glow-filter-${id})`}
        />
        {/* Inner bright ring */}
        <ellipse cx="50" cy="78" rx="26" ry="4.5"
          fill="none"
          stroke={theme.glow}
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* Core ring highlight */}
        <ellipse cx="50" cy="78" rx="16" ry="2.5"
          fill="none"
          stroke={theme.glow}
          strokeWidth="0.8"
          opacity="0.9"
        />
        {/* Ring reflection dots */}
        <circle cx="24" cy="78" r="1.2" fill={theme.glow} opacity="0.6" />
        <circle cx="76" cy="78" r="1.2" fill={theme.glow} opacity="0.6" />
        <circle cx="36" cy="82" r="0.8" fill={theme.glow} opacity="0.4" />
        <circle cx="64" cy="82" r="0.8" fill={theme.glow} opacity="0.4" />
      </g>

      {/* Light rays behind logo */}
      <LightRays color={theme.glow} />

      {/* Style tag for animations */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes platformPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </svg>
  );
}

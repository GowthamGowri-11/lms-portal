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
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          {/* Main Vibrant Cyan-Blue-Purple Gradient */}
          <linearGradient id="atlyxGradMain" x1="0.1" y1="0.1" x2="0.8" y2="0.9">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="25%" stopColor="#0088ff" />
            <stop offset="65%" stopColor="#3d44f6" />
            <stop offset="100%" stopColor="#7928ca" />
          </linearGradient>

          {/* 3D Bevel / Highlight Gradient for Top & Left Edge */}
          <linearGradient id="atlyxHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#80f7ff" />
            <stop offset="50%" stopColor="#00a2ff" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          {/* Right Detached Leg Metallic Silver/Ice-Blue Gradient */}
          <linearGradient id="atlyxSilverLeg" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Bevel Shadow for 3D depth */}
          <linearGradient id="atlyxBottomShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b0764" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
          </linearGradient>

          {/* Ambient Glow */}
          <filter id="atlyxGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0088ff" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 3D Bottom/Under Bevel Layer */}
        <g filter="url(#atlyxGlow)">
          {/* Detached Right Leg Shadow */}
          <polygon
            points="63,56 70,53 82,78 71,81"
            fill="url(#atlyxBottomShadow)"
          />

          {/* Detached Right Leg (Metallic Silver / Slate Blue) */}
          <polygon
            points="63,53 71,53 81,77 71,77"
            fill="url(#atlyxSilverLeg)"
          />

          {/* Detached Right Leg 3D Bottom Edge */}
          <polygon
            points="71,77 81,77 79,80 69,80"
            fill="#475569"
          />

          {/* Main 'A' + Dynamic Checkmark Slash Base (Purple Depth Bottom) */}
          <path
            d="M 45,21 L 55,21 L 56,23 L 44,23 Z 
               M 20,77 L 34,77 L 32,80 L 18,80 Z 
               M 40,84 L 43,84 L 86,37 L 85,35 Z"
            fill="url(#atlyxBottomShadow)"
          />

          {/* Main 'A' Body & Dynamic Slash Face */}
          <path
            d="M 45,18 
               L 55,18 
               L 64,36 
               L 53,43 
               L 48,34 
               L 36,58 
               L 50,58 
               L 40,84 
               L 19,77 
               L 45,18 Z"
            fill="url(#atlyxGradMain)"
          />

          {/* Dynamic Shooting Slash (Crossing up-right) */}
          <path
            d="M 40,84 
               L 51,60 
               L 86,35 
               L 53,52 
               L 40,84 Z"
            fill="url(#atlyxGradMain)"
          />

          {/* Top Inner Triangle of 'A' (Dark Negative Space Hole) */}
          <polygon
            points="48,34 53,43 42,43"
            fill="#1a1a1d"
            opacity="0.9"
          />

          {/* Upper Apex 3D Light Highlight Accent */}
          <path
            d="M 45,18 L 55,18 L 53,22 L 46,22 Z"
            fill="url(#atlyxHighlight)"
          />
        </g>
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

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpaceIntroScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the intro in this browser session
    const hasSeen = sessionStorage.getItem('atlyx_intro_shown');
    if (!hasSeen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      // Automatically hide and mark as seen after 2.8 seconds
      const timer = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('atlyx_intro_shown', 'true');
      }, 2800);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, []);

  const handleSkip = () => {
    setShow(false);
    document.body.style.overflow = '';
    sessionStorage.setItem('atlyx_intro_shown', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'radial-gradient(circle at center, #1e1848 0%, #070912 75%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            gap: '36px'
          }}
        >
          {/* Skip Intro Button */}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '28px',
              right: '28px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#818cf8'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
          >
            SKIP INTRO ✕
          </button>

          {/* Background Twinkling Stars Grid */}
          <div className="intro-space-stars">
            <span style={{ top: '12%', left: '20%', animationDelay: '0s' }} />
            <span style={{ top: '22%', left: '78%', animationDelay: '0.6s' }} />
            <span style={{ top: '68%', left: '18%', animationDelay: '1.1s' }} />
            <span style={{ top: '82%', left: '82%', animationDelay: '0.3s' }} />
            <span style={{ top: '32%', left: '12%', animationDelay: '1.7s' }} />
            <span style={{ top: '62%', left: '88%', animationDelay: '1.4s' }} />
            <span style={{ top: '15%', left: '50%', animationDelay: '0.9s' }} />
            <span style={{ top: '85%', left: '45%', animationDelay: '0.5s' }} />
          </div>

          {/* Central Cosmic Planet Component */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Hyperspace Rings */}
            <div className="intro-warp-ring intro-ring-1" />
            <div className="intro-warp-ring intro-ring-2" />
            <div className="intro-warp-ring intro-ring-3" />

            {/* Orbiting Ring & Satellite */}
            <div className="intro-planet-orbit">
              <div className="intro-moon-carrier">
                <div className="intro-orbiting-moon" />
              </div>
            </div>

            {/* Glowing Core Sphere */}
            <div className="intro-cosmic-planet">
              <div className="intro-planet-crater intro-crater-1" />
              <div className="intro-planet-crater intro-crater-2" />
            </div>
          </div>
          
          {/* Typography & Subtext */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <div style={{
              color: '#f8fafc',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #fff 0%, #818cf8 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 35px rgba(129, 140, 248, 0.6)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              WELCOME TO ATLYX
            </div>
            <div style={{
              color: 'var(--text-tertiary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.85
            }}>
              Initiating Cosmic Learning Experience<span className="intro-loading-dots"></span>
            </div>
          </div>

          {/* Pure CSS Styles */}
          <style>{`
            .intro-space-stars span {
              position: absolute;
              width: 4px;
              height: 4px;
              background: #fff;
              border-radius: 50%;
              box-shadow: 0 0 10px #fff, 0 0 20px #818cf8;
              animation: intro-twinkle 2s infinite ease-in-out;
            }

            @keyframes intro-twinkle {
              0%, 100% { opacity: 0.2; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.6); }
            }

            .intro-warp-ring {
              position: absolute;
              border-radius: 50%;
              border: 1px dashed rgba(129, 140, 248, 0.35);
              animation: intro-spin-cw 10s linear infinite;
            }

            .intro-ring-1 {
              width: 190px;
              height: 190px;
              border-color: rgba(99, 102, 241, 0.45);
              border-width: 2px;
              border-style: solid;
              border-top-color: transparent;
              border-left-color: transparent;
              animation-duration: 8s;
            }

            .intro-ring-2 {
              width: 155px;
              height: 155px;
              border: 1px dashed rgba(236, 72, 153, 0.6);
              animation: intro-spin-ccw 10s linear infinite;
            }

            .intro-ring-3 {
              width: 235px;
              height: 235px;
              border: 1px solid rgba(45, 212, 191, 0.25);
              border-bottom-color: var(--accent-secondary);
              animation: intro-spin-cw 6s linear infinite;
            }

            .intro-planet-orbit {
              position: absolute;
              width: 175px;
              height: 55px;
              border: 2px solid rgba(255, 255, 255, 0.25);
              border-radius: 50%;
              transform: rotate(-25deg);
              animation: intro-orbit-tilt 5s ease-in-out infinite alternate;
              box-shadow: 0 0 20px rgba(129, 140, 248, 0.35);
            }

            .intro-moon-carrier {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              animation: intro-orbit-spin 3s linear infinite;
            }

            @keyframes intro-orbit-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .intro-orbiting-moon {
              position: absolute;
              top: -7px;
              left: 50%;
              width: 14px;
              height: 14px;
              background: #34d399;
              border-radius: 50%;
              box-shadow: 0 0 14px #34d399, 0 0 28px #fff;
              transform: translateX(-50%);
            }

            .intro-cosmic-planet {
              position: relative;
              width: 84px;
              height: 84px;
              border-radius: 50%;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
              box-shadow: 
                0 0 40px rgba(139, 92, 246, 0.75),
                inset -12px -12px 24px rgba(0, 0, 0, 0.6),
                inset 6px 6px 18px rgba(255, 255, 255, 0.45);
              animation: intro-planet-float 3.5s ease-in-out infinite;
              overflow: hidden;
            }

            .intro-planet-crater {
              position: absolute;
              background: rgba(0, 0, 0, 0.18);
              border-radius: 50%;
            }

            .intro-crater-1 {
              width: 20px;
              height: 14px;
              top: 20%;
              left: 25%;
              transform: rotate(-15deg);
            }

            .intro-crater-2 {
              width: 28px;
              height: 18px;
              bottom: 25%;
              right: 20%;
              transform: rotate(20deg);
            }

            @keyframes intro-spin-cw {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes intro-spin-ccw {
              0% { transform: rotate(360deg); }
              100% { transform: rotate(0deg); }
            }

            @keyframes intro-planet-float {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-6px) scale(1.05); }
            }

            @keyframes intro-orbit-tilt {
              0% { transform: rotate(-25deg) scaleX(1); }
              100% { transform: rotate(-15deg) scaleX(1.1); }
            }

            .intro-loading-dots {
              display: inline-block;
              width: 1.5em;
              text-align: left;
            }

            .intro-loading-dots::after {
              content: '';
              animation: intro-dots 1.5s infinite step-start;
            }

            @keyframes intro-dots {
              0% { content: ''; }
              25% { content: '.'; }
              50% { content: '..'; }
              75% { content: '...'; }
              100% { content: ''; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

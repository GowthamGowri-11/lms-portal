'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { openAuthModal } from '@/lib/auth-modal-events';

export default function HeroAuthButtons() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handlePrimaryClick = () => {
    if (status === 'loading') return;
    if (session) {
      if (session.user?.role === 'ADMIN') router.push('/admin');
      else if (session.user?.role === 'TRAINER') router.push('/dashboard/trainer');
      else router.push('/dashboard/student');
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', minHeight: '56px' }}>
      <motion.button
        className="btn-hero-primary"
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={{
          initial: { scale: 1, y: 0, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' },
          hover: { scale: 1.03, y: -4, boxShadow: '0 12px 24px -6px rgba(37, 99, 235, 0.4)' },
          tap: { scale: 0.97, y: 1, boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' }
        }}
        onClick={handlePrimaryClick}
        style={{
          padding: '16px 32px',
          minWidth: '270px',
          minHeight: '56px',
          borderRadius: '100px',
          background: 'var(--accent-primary)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1,
        }}
      >
        <motion.div
          variants={{
            initial: { left: '-101%' },
            hover: { left: '0%' }
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '100%',
            background: '#0f172a',
            zIndex: -1,
            borderRadius: '100px',
          }}
        />
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {status === 'loading' ? (
            <span>Loading...</span>
          ) : session ? (
            <>
              <LayoutDashboard size={20} />
              <span>Go to My Dashboard</span>
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Start Learning with ATLYX</span>
              <ArrowRight size={18} />
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
}

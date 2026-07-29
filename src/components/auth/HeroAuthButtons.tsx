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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <motion.button
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={{
          initial: { scale: 1, boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)' },
          hover: { scale: 1.04, boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)' },
          tap: { scale: 0.97 }
        }}
        onClick={handlePrimaryClick}
        style={{
          padding: '16px 32px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          backgroundSize: '200% 200%',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <motion.div
          variants={{
            initial: { left: '-150%' },
            hover: { left: '150%' }
          }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: '-150%',
            width: '150%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.2) 75%, transparent)',
            pointerEvents: 'none',
            zIndex: 1
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
              <span>Start Learning Now</span>
              <ArrowRight size={18} />
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
}


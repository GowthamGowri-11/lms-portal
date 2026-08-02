'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Presentation, Phone, Calendar, School, ArrowRight, CheckCircle2, AlertCircle, X, LogIn, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  // Form state for registration / onboarding
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('Undergraduate');
  const [intendedRole, setIntendedRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT');

  useEffect(() => {
    setMounted(true);

    const handleOpenModal = (e: any) => {
      setMode(e.detail?.mode || 'signin');
      setError('');
      setSuccessMsg('');
      setIsOpen(true);
    };

    window.addEventListener('open-auth-modal', handleOpenModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenModal);
  }, []);

  // Automatic background onboarding check when OAuth completes and returns to site
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      const pendingDataRaw = localStorage.getItem('atlyx_pending_onboarding');

      if (pendingDataRaw) {
        try {
          const pendingData = JSON.parse(pendingDataRaw);
          setLoading(true);
          setIsOpen(true);
          setSuccessMsg('Setting up your profile...');

          fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingData),
          })
            .then((res) => res.json())
            .then(async (data) => {
              if (data.success) {
                localStorage.removeItem('atlyx_pending_onboarding');
                await update({ isOnboarded: true, role: data.role });
                setSuccessMsg(data.message);
                setTimeout(() => {
                  setIsOpen(false);
                  if (data.role === 'TRAINER') {
                    router.push('/dashboard/trainer');
                  } else {
                    router.push('/dashboard/student');
                  }
                  router.refresh();
                }, 1500);
              } else {
                localStorage.removeItem('atlyx_pending_onboarding');
                setError(data.error || 'Failed to complete setup.');
                setLoading(false);
              }
            })
            .catch(() => {
              localStorage.removeItem('atlyx_pending_onboarding');
              setLoading(false);
            });
        } catch (e) {
          localStorage.removeItem('atlyx_pending_onboarding');
        }
      } else if (!user.isOnboarded && user.role !== 'ADMIN' && !pathname?.startsWith('/admin')) {
        // Force the user to complete their profile
        setMode('signup');
        setIsOpen(true);
      }
    }
  }, [session, status, pathname, router, update]);

  if (!isOpen || !mounted) return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', { callbackUrl: window.location.pathname });
  };

  const handleSignUpAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    const numAge = parseInt(age, 10);
    if (!age || isNaN(numAge) || numAge < 10 || numAge > 100) {
      setError('Please enter a valid age between 10 and 100.');
      return;
    }

    // Save registration details in localStorage so they can be processed immediately after Google OAuth
    const onboardingPayload = {
      phone: phone.trim(),
      age: age.trim(),
      education,
      intendedRole,
    };

    if (status === 'authenticated') {
      // User is already logged in, submit directly without OAuth redirect
      setLoading(true);
      fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingPayload),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success || !data.error) {
            await update({ isOnboarded: true, role: data.role });
            setSuccessMsg(data.message || 'Profile saved!');
            setTimeout(() => {
              setIsOpen(false);
              if (data.role === 'TRAINER') router.push('/dashboard/trainer');
              else router.push('/dashboard/student');
              router.refresh();
            }, 1200);
          } else {
            setError(data.error || 'Failed to save profile.');
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Network error occurred.');
          setLoading(false);
        });
    } else {
      // User is new, save to localStorage and initiate Google OAuth
      localStorage.setItem('atlyx_pending_onboarding', JSON.stringify(onboardingPayload));
      setLoading(true);
      signIn('google', { callbackUrl: window.location.pathname });
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        style={{
          width: '100%',
          maxWidth: mode === 'signup' ? '540px' : '440px',
          background: 'linear-gradient(145deg, rgba(28, 28, 33, 0.96), rgba(15, 15, 19, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.15)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Close Button - hide if user is logged in but forced to onboard */}
        {!(status === 'authenticated' && session?.user && !(session.user as any).isOnboarded && (session.user as any).role !== 'ADMIN') && (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          >
            <X size={18} />
          </button>
        )}

        {/* Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
          }}>
            <GraduationCap size={28} color="#fff" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Join ATLYX'}
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            {mode === 'signin'
              ? 'Sign in to access your enrolled courses and progress.'
              : 'Fill in your details below to set up your profile and join ATLYX.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {mode === 'signin' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#18181b',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
                transition: 'transform 0.15s ease, background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignUpAndContinue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Phone field */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  <Phone size={14} color="#818cf8" /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>

              {/* Age field */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                  <Calendar size={14} color="#818cf8" /> Age
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 21"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>
            </div>

            {/* Education field */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                <School size={14} color="#818cf8" /> Current Education / Background
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(20, 20, 25, 0.95)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="School Student">School Student (High School / K-12)</option>
                <option value="Undergraduate">Undergraduate Student (College / University)</option>
                <option value="Postgraduate">Postgraduate Student (Master's / PhD)</option>
                <option value="Working Professional">Working Tech Professional</option>
                <option value="Professional Trainer">Professional Trainer / Educator</option>
              </select>
            </div>

            {/* Path Selection Cards */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
                I am joining as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => setIntendedRole('STUDENT')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: intendedRole === 'STUDENT' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: intendedRole === 'STUDENT' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <BookOpen size={18} color={intendedRole === 'STUDENT' ? '#818cf8' : '#fff'} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Student</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Learn & Enroll</div>
                  </div>
                </div>

                <div
                  onClick={() => setIntendedRole('TRAINER')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: intendedRole === 'TRAINER' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: intendedRole === 'TRAINER' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <Presentation size={18} color={intendedRole === 'TRAINER' ? '#c084fc' : '#fff'} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Trainer</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Teach courses</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '6px',
                boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.5)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>{loading ? 'Processing...' : status === 'authenticated' ? 'Save Profile & Continue' : 'Sign Up with Google'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

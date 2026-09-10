'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Presentation, 
  Phone, 
  Calendar, 
  School, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Check
} from 'lucide-react';

import BrandLogo from '@/components/ui/BrandLogo';

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

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
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
                setSuccessMsg(data.message || 'Welcome to ATLYX!');
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
    setError('');
    signIn('google', { callbackUrl: window.location.pathname });
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    // Directly initiate login flow
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

    const onboardingPayload = {
      phone: phone.trim(),
      age: age.trim(),
      education,
      intendedRole,
      name: fullName.trim() || undefined,
    };

    if (status === 'authenticated') {
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
      localStorage.setItem('atlyx_pending_onboarding', JSON.stringify(onboardingPayload));
      setLoading(true);
      signIn('google', { callbackUrl: window.location.pathname });
    }
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !(status === 'authenticated' && session?.user && !(session.user as any).isOnboarded && (session.user as any).role !== 'ADMIN')) {
          setIsOpen(false);
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        style={{
          width: '100%',
          maxWidth: mode === 'signup' ? '460px' : '390px',
          backgroundColor: '#1a1a1d',
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(56, 189, 248, 0.12), transparent 70%), linear-gradient(180deg, #1c1c20 0%, #151518 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px 26px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 114, 255, 0.1)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'max-width 0.25s ease',
        }}
      >
        {/* Subtle Ambient Backlight */}
        <div 
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '260px',
            height: '140px',
            background: 'radial-gradient(ellipse, rgba(0, 210, 255, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }} 
        />

        {/* Close Button ('X') at top right */}
        {!(status === 'authenticated' && session?.user && !(session.user as any).isOnboarded && (session.user as any).role !== 'ADMIN') && (
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Brand Header: Logo + ATLYX Title (LeetCode Style) */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px',
            }}
          >
            {/* ATLYX 3D Vector Logo */}
            <BrandLogo size={52} />
          </div>

          <div style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
            letterSpacing: '0.04em',
            color: '#ffffff',
            lineHeight: 1.1,
            marginTop: '4px',
            marginBottom: '4px',
          }}>
            ATLYX
          </div>
          {mode === 'signup' && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>
              Create your account &amp; get started
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* SIGN IN FORM (Matching LeetCode Reference Image 2) */}
        {mode === 'signin' ? (
          <form onSubmit={handleCustomSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {/* Username or E-mail Input */}
            <div>
              <input
                type="text"
                placeholder="Username or E-mail"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(56, 189, 248, 0.8)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
              />
            </div>

            {/* Password Input with visibility toggle */}
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(56, 189, 248, 0.8)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Cloudflare Verification Box (LeetCode Reference Image 2) */}
            <div
              style={{
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none',
              }}
            >
              {/* Left: Verified Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Check size={15} color="#ffffff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>
                  Success!
                </span>
              </div>

              {/* Right: Cloudflare Logo + Links */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="20" height="13" viewBox="0 0 32 22" fill="none">
                    <path
                      d="M24.8 8.8C24.1 3.9 19.8 0 14.7 0C10.5 0 6.9 2.6 5.4 6.4C2.3 7.1 0 9.8 0 13.2C0 17 3.1 20 6.9 20H24.5C28.6 20 32 16.6 32 12.5C32 8.7 28.9 5.6 25.1 5.3C25 6.5 24.9 7.7 24.8 8.8Z"
                      fill="#F6821F"
                    />
                    <path
                      d="M24.8 8.8C24.6 7.4 24.1 6.1 23.3 5C22.5 3.9 21.4 3 20.1 2.4C20.8 4.4 20.9 6.6 20.4 8.7C20 10.4 18.9 11.9 17.5 13C16.1 14.1 14.4 14.7 12.6 14.7H11.2C10.7 14.7 10.3 15.1 10.3 15.6C10.3 16.1 10.7 16.5 11.2 16.5H24.5C26.4 16.5 28.2 15.7 29.5 14.4C30.8 13.1 31.6 11.3 31.6 9.4C31.6 9.2 31.6 9 31.6 8.8C31.5 8.8 28.2 8.8 24.8 8.8Z"
                      fill="#FAAE40"
                    />
                  </svg>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: '#ffffff' }}>
                    CLOUDFLARE
                  </span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                  <span>Privacy</span> • <span>Help</span>
                </div>
              </div>
            </div>

            {/* High-Contrast White Sign In Button (LeetCode Reference) */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#18181b',
                fontWeight: 700,
                fontSize: '0.94rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '2px',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.16)',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#f4f4f5';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 255, 255, 0.25)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 255, 255, 0.16)';
                }
              }}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>

            {/* Legal Notice */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.76rem',
                color: 'rgba(255, 255, 255, 0.55)',
                margin: '2px 0 0',
                lineHeight: 1.4,
              }}
            >
              By continuing, you agree to{' '}
              <span style={{ color: '#38bdf8', cursor: 'pointer' }}>Terms</span> &amp;{' '}
              <span style={{ color: '#38bdf8', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>

            {/* Navigation: Forgot Password? | Sign Up */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.85)',
                paddingTop: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setError('Password reset instructions will be sent to your email.');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.82rem',
                  transition: 'color 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
              >
                Forgot Password?
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('signup');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.82rem',
                  transition: 'color 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#ffffff')}
              >
                Sign Up
              </button>
            </div>

            {/* Divider: "or you can sign in with" */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '8px 0 2px',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)', whiteSpace: 'nowrap' }}>
                or you can sign in with
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Social Logins Row (Google, GitHub, Apple, LinkedIn) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                paddingTop: '2px',
              }}
            >
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                title="Sign in with Google"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.9 9.2 5 12 5z" />
                  <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6c-.3 1.4-1.1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.2-4.7 3.2-8.1z" />
                  <path fill="#FBBC05" d="M5.9 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L2.2 7.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.7-2.8z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.6-2.8c-1.1.7-2.5 1.2-4.4 1.2-2.8 0-5.2-1.9-6.1-4.5L2.2 16.7C4 20.3 7.7 23 12 23z" />
                </svg>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                title="Sign in with GitHub"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  color: '#ffffff',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                title="Sign in with Apple"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  color: '#ffffff',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.95 2.82 1.02.08 2.06-.51 2.68-1.26z" />
                </svg>
              </button>

              {/* LinkedIn Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                title="Sign in with LinkedIn"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  color: '#ffffff',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP / REGISTRATION FORM */
          <form onSubmit={handleSignUpAndContinue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Full Name field */}
            <div>
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  borderRadius: '9px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>

            {/* Phone & Age Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '5px' }}>
                  <Phone size={13} color="#38bdf8" /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '5px' }}>
                  <Calendar size={13} color="#38bdf8" /> Age
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="21"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>

            {/* Education select */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '5px' }}>
                <School size={13} color="#38bdf8" /> Current Education / Background
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  borderRadius: '9px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#1e1e24',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="School Student">School Student (High School / K-12)</option>
                <option value="Undergraduate">Undergraduate (College / University)</option>
                <option value="Postgraduate">Postgraduate (Master&apos;s / PhD)</option>
                <option value="Working Professional">Working Tech Professional</option>
                <option value="Professional Trainer">Professional Trainer / Educator</option>
              </select>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '6px' }}>
                I am joining as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div
                  onClick={() => setIntendedRole('STUDENT')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: intendedRole === 'STUDENT' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: intendedRole === 'STUDENT' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BookOpen size={16} color={intendedRole === 'STUDENT' ? '#38bdf8' : '#aaa'} />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Student</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>Learn & Enroll</div>
                  </div>
                </div>

                <div
                  onClick={() => setIntendedRole('TRAINER')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: intendedRole === 'TRAINER' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: intendedRole === 'TRAINER' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Presentation size={16} color={intendedRole === 'TRAINER' ? '#c084fc' : '#aaa'} />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Trainer</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>Teach courses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#18181b',
                fontWeight: 700,
                fontSize: '0.94rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.18)',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#f4f4f5';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>{loading ? 'Processing...' : status === 'authenticated' ? 'Save Profile & Continue' : 'Create Account with Google'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Switch to Sign In */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('signin');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                Already have an account? <span style={{ color: '#ffffff', fontWeight: 600 }}>Sign In</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

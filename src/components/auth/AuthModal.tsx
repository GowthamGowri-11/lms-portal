'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Presentation, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Check,
  ArrowLeft,
  Loader2
} from 'lucide-react';

import BrandLogo from '@/components/ui/BrandLogo';

export default function AuthModal() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  // screen: 'select' | 'email' | 'signup'
  const [screen, setScreen] = useState<'select' | 'email' | 'signup'>('select');
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
      const targetScreen = e.detail?.mode === 'signup' ? 'signup' : 'select';
      setScreen(targetScreen);
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
        setScreen('signup');
        setIsOpen(true);
      }
    }
  }, [session, status, pathname, router, update]);

  if (!isOpen || !mounted) return null;

  const isMandatoryOnboarding =
    status === 'authenticated' &&
    session?.user &&
    !(session.user as any).isOnboarded &&
    (session.user as any).role !== 'ADMIN';

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    signIn('google', { callbackUrl: window.location.pathname });
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isMandatoryOnboarding) {
          setIsOpen(false);
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '364px',
          backgroundColor: '#080808',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '36px 28px',
          color: '#EDEDED',
          position: 'relative',
          boxSizing: 'border-box',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Close Button if not mandatory onboarding */}
        {!isMandatoryOnboarding && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
<<<<<<< HEAD
            aria-label="Close authentication modal"
=======
            aria-label="Close"
>>>>>>> bc92108d881e72d607877eada892e52f9fd54b11
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#8A8F98',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
          >
            <X size={18} />
          </button>
        )}

<<<<<<< HEAD
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
=======
        <AnimatePresence mode="wait">
          {screen === 'select' && (
            <motion.div
              key="modal-select"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column' }}
>>>>>>> bc92108d881e72d607877eada892e52f9fd54b11
            >
              {/* ATLYX Logo */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BrandLogo size={42} />
              </div>

              {/* Exact Spacing: 36px */}
              <div style={{ height: '36px' }} />

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Log in to ATLYX
              </h2>

              {/* Exact Spacing: 40px */}
              <div style={{ height: '40px' }} />

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Button: 52px, #5B5BD6 */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: '#5B5BD6',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease',
                  letterSpacing: '-0.01em',
                  opacity: loading ? 0.75 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#6868E1';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#5B5BD6';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.9 9.2 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6c-.3 1.4-1.1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.2-4.7 3.2-8.1z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.9 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L2.2 7.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.7-2.8z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.6-2.8c-1.1.7-2.5 1.2-4.4 1.2-2.8 0-5.2-1.9-6.1-4.5L2.2 16.7C4 20.3 7.7 23 12 23z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </div>
              </button>

              {/* Exact Spacing: 14px */}
              <div style={{ height: '14px' }} />

              {/* Email Button: 52px, #202024 */}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setScreen('email');
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: '#202024',
                  color: '#E5E7EB',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease',
                  letterSpacing: '-0.01em',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#29292F')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#202024')}
              >
                <span>Continue with Email</span>
              </button>

              {/* Switch link */}
              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#8A8F98' }}>Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('signup');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EDEDED',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'email' && (
            <motion.div
              key="modal-email"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {/* Back navigation */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('select');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8A8F98',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
                >
                  <ArrowLeft size={13} />
                  <span>All sign in options</span>
                </button>
              </div>

              {/* Logo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
                <BrandLogo size={36} />
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: '0 0 6px 0',
                }}
              >
                Log in with email
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8F98',
                  textAlign: 'center',
                  margin: '0 0 24px 0',
                }}
              >
                Enter your credentials to continue.
              </p>

              {error && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCustomSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#8A8F98',
                      marginBottom: '6px',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121215',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#8A8F98' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError('Password reset instructions will be sent to your email.')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8A8F98',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 38px 0 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
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
                        background: 'none',
                        border: 'none',
                        color: '#8A8F98',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Verification Badge */}
                <div
                  style={{
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: '#101014',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#EDEDED' }}>
                      Security Verification
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#8A8F98', letterSpacing: '0.04em' }}>
                    CLOUDFLARE
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    backgroundColor: '#5B5BD6',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '4px',
                    transition: 'background-color 0.15s ease',
                    opacity: loading ? 0.75 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#6868E1';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#5B5BD6';
                  }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#8A8F98' }}>Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setScreen('signup');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EDEDED',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'signup' && (
            <motion.div
              key="modal-signup"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {!isMandatoryOnboarding && (
                <div style={{ marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('select');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8A8F98',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
                  >
                    <ArrowLeft size={13} />
                    <span>Back to log in</span>
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                <BrandLogo size={36} />
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: '0 0 6px 0',
                }}
              >
                Create your account
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8F98',
                  textAlign: 'center',
                  margin: '0 0 20px 0',
                }}
              >
                {isMandatoryOnboarding ? 'Complete your profile to proceed' : 'Join ATLYX to start learning or teaching.'}
              </p>

              {error && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignUpAndContinue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#8A8F98', marginBottom: '6px' }}>
                    Full Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121215',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#8A8F98', marginBottom: '6px' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#8A8F98', marginBottom: '6px' }}>
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      placeholder="22"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#8A8F98', marginBottom: '6px' }}>
                    Education
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121215',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="School Student">School Student</option>
                    <option value="Undergraduate">Undergraduate (College / Univ)</option>
                    <option value="Postgraduate">Postgraduate (Master&apos;s / PhD)</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Professional Trainer">Professional Trainer / Educator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#8A8F98', marginBottom: '6px' }}>
                    I am joining as:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIntendedRole('STUDENT')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '6px',
                        border: intendedRole === 'STUDENT' ? '1px solid #5B5BD6' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: intendedRole === 'STUDENT' ? 'rgba(91, 91, 214, 0.12)' : '#121215',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'left',
                      }}
                    >
                      <BookOpen size={14} color={intendedRole === 'STUDENT' ? '#5B5BD6' : '#8A8F98'} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>Student</div>
                        <div style={{ fontSize: '10px', color: '#8A8F98' }}>Learn</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIntendedRole('TRAINER')}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '6px',
                        border: intendedRole === 'TRAINER' ? '1px solid #5B5BD6' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: intendedRole === 'TRAINER' ? 'rgba(91, 91, 214, 0.12)' : '#121215',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textAlign: 'left',
                      }}
                    >
                      <Presentation size={14} color={intendedRole === 'TRAINER' ? '#5B5BD6' : '#8A8F98'} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#FFFFFF' }}>Trainer</div>
                        <div style={{ fontSize: '10px', color: '#8A8F98' }}>Teach</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    backgroundColor: '#5B5BD6',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '4px',
                    transition: 'background-color 0.15s ease',
                    opacity: loading ? 0.75 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#6868E1';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#5B5BD6';
                  }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Setting up...</span>
                    </div>
                  ) : (
                    <span>Continue with Google</span>
                  )}
                </button>
              </form>

              {!isMandatoryOnboarding && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#8A8F98' }}>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('select');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EDEDED',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Log in
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

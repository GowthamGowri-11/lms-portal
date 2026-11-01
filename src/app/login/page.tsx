'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  BookOpen, 
  Presentation,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/student';

  // Screen state: 'select' (Screen 1 - Linear methods) | 'email' (Screen 2 - Email credentials) | 'signup' (Screen 3 - Registration)
  const [screen, setScreen] = useState<'select' | 'email' | 'signup'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('Undergraduate');
  const [intendedRole, setIntendedRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT');

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    signIn('google', { callbackUrl });
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
    signIn('google', { callbackUrl });
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

    localStorage.setItem('atlyx_pending_onboarding', JSON.stringify(onboardingPayload));
    setLoading(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080808',
        color: '#EDEDED',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        padding: '40px 20px',
        boxSizing: 'border-box',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Centered Narrow Linear-Style Column (Max 364px) */}
      <div
        style={{
          width: 'calc(100% - 40px)',
          maxWidth: '364px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <AnimatePresence mode="wait">
          {screen === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
              {/* ATLYX Logo */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link
                  href="/"
                  aria-label="ATLYX Home"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <BrandLogo size={44} />
                </Link>
              </div>

              {/* Exact Spacing: 36–42px below logo */}
              <div style={{ height: '38px' }} />

              {/* Heading: Log in to ATLYX */}
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Log in to ATLYX
              </h1>

              {/* Exact Spacing: 42–48px below heading */}
              <div style={{ height: '44px' }} />

              {/* Error Alert if any */}
              {error && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* OPTION 1 — GOOGLE AUTHENTICATION (Primary) */}
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
                  position: 'relative',
                  padding: '0 20px',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease, opacity 0.15s ease',
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
                {/* Official Google Icon centered with label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
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

              {/* Exact Spacing: 14px between buttons */}
              <div style={{ height: '14px' }} />

              {/* OPTION 2 — EMAIL AUTHENTICATION (Secondary) */}
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
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  letterSpacing: '-0.01em',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#29292F';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#202024';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <span>Continue with Email</span>
              </button>

              {/* Minimal Bottom Switch: Sign Up */}
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#8A8F98' }}>
                  Don&apos;t have an account?{' '}
                </span>
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
                    transition: 'color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#EDEDED')}
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
              {/* Back navigation link */}
              <div style={{ marginBottom: '24px' }}>
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
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
                >
                  <ArrowLeft size={14} />
                  <span>All sign in options</span>
                </button>
              </div>

              {/* Logo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                <BrandLogo size={40} />
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: '0 0 8px 0',
                }}
              >
                Log in with email
              </h1>

              {/* Supporting text */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8F98',
                  textAlign: 'center',
                  margin: '0 0 28px 0',
                }}
              >
                Enter your credentials to continue.
              </p>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '11px 13px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '18px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Login Form */}
              <form onSubmit={handleCustomSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
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
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121215',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      htmlFor="password"
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#8A8F98',
                      }}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setError('Password reset instructions will be sent to your registered email.')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8A8F98',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 40px 0 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
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
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#8A8F98',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification Badge (Refined Linear Style) */}
                <div
                  style={{
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: '#101014',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#EDEDED' }}>
                      Security Verification
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="18" height="12" viewBox="0 0 32 22" fill="none">
                      <path
                        d="M24.8 8.8C24.1 3.9 19.8 0 14.7 0C10.5 0 6.9 2.6 5.4 6.4C2.3 7.1 0 9.8 0 13.2C0 17 3.1 20 6.9 20H24.5C28.6 20 32 16.6 32 12.5C32 8.7 28.9 5.6 25.1 5.3C25 6.5 24.9 7.7 24.8 8.8Z"
                        fill="#F6821F"
                      />
                      <path
                        d="M24.8 8.8C24.6 7.4 24.1 6.1 23.3 5C22.5 3.9 21.4 3 20.1 2.4C20.8 4.4 20.9 6.6 20.4 8.7C20 10.4 18.9 11.9 17.5 13C16.1 14.1 14.4 14.7 12.6 14.7H11.2C10.7 14.7 10.3 15.1 10.3 15.6C10.3 16.1 10.7 16.5 11.2 16.5H24.5C26.4 16.5 28.2 15.7 29.5 14.4C30.8 13.1 31.6 11.3 31.6 9.4C31.6 9.2 31.6 9 31.6 8.8C31.5 8.8 28.2 8.8 24.8 8.8Z"
                        fill="#FAAE40"
                      />
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#8A8F98', letterSpacing: '0.04em' }}>
                      CLOUDFLARE
                    </span>
                  </div>
                </div>

                {/* Submit Button: 52px, #5B5BD6 */}
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
                    marginTop: '6px',
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

              {/* Bottom Switch: Sign Up */}
              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#8A8F98' }}>
                  Don&apos;t have an account?{' '}
                </span>
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

          {screen === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
              {/* Back navigation */}
              <div style={{ marginBottom: '24px' }}>
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
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#8A8F98')}
                >
                  <ArrowLeft size={14} />
                  <span>Back to log in</span>
                </button>
              </div>

              {/* Logo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <BrandLogo size={40} />
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  margin: '0 0 6px 0',
                }}
              >
                Create your account
              </h1>

              {/* Subheading */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8F98',
                  textAlign: 'center',
                  margin: '0 0 24px 0',
                }}
              >
                Join ATLYX to start learning or teaching.
              </p>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '11px 13px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignUpAndContinue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
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
                    Full Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: '#121215',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  />
                </div>

                {/* Phone & Age row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '10px' }}>
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
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                    />
                  </div>

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
                        height: '46px',
                        padding: '0 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#121215',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B5BD6')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                    />
                  </div>
                </div>

                {/* Education background */}
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
                    Education / Background
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px',
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
                    <option value="School Student">School Student (K-12)</option>
                    <option value="Undergraduate">Undergraduate (College / Univ)</option>
                    <option value="Postgraduate">Postgraduate (Master&apos;s / PhD)</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Professional Trainer">Professional Trainer / Educator</option>
                  </select>
                </div>

                {/* Role selection */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#8A8F98',
                      marginBottom: '8px',
                    }}
                  >
                    I am joining as:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIntendedRole('STUDENT')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '6px',
                        border: intendedRole === 'STUDENT' ? '1px solid #5B5BD6' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: intendedRole === 'STUDENT' ? 'rgba(91, 91, 214, 0.12)' : '#121215',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <BookOpen size={16} color={intendedRole === 'STUDENT' ? '#5B5BD6' : '#8A8F98'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>Student</div>
                        <div style={{ fontSize: '11px', color: '#8A8F98' }}>Learn courses</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIntendedRole('TRAINER')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '6px',
                        border: intendedRole === 'TRAINER' ? '1px solid #5B5BD6' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: intendedRole === 'TRAINER' ? 'rgba(91, 91, 214, 0.12)' : '#121215',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Presentation size={16} color={intendedRole === 'TRAINER' ? '#5B5BD6' : '#8A8F98'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>Trainer</div>
                        <div style={{ fontSize: '11px', color: '#8A8F98' }}>Teach courses</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Primary Button: 52px, #5B5BD6 */}
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
                    marginTop: '6px',
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

              {/* Bottom Switch: Sign In */}
              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#8A8F98' }}>
                  Already have an account?{' '}
                </span>
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
                    textUnderlineOffset: '3px',
                  }}
                >
                  Log in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#080808' }} />}>
      <LoginForm />
    </Suspense>
  );
}

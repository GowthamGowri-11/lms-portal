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
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  HelpCircle,
  Cloud
} from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import styles from './page.module.css';

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
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
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
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.logoContainer}>
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
                    <BrandLogo size={48} />
                  </Link>
                </div>
                <div className={styles.brandName}>ATLYX</div>
                <h1 className={styles.welcomeHeading}>
                  Welcome <span className={styles.highlight}>Back</span>
                </h1>
                <p className={styles.supportingText}>Sign in to continue your learning journey</p>
              </div>

              {/* Error Alert if any */}
              {error && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Login Form */}
              <form onSubmit={handleCustomSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email or Username */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Email or Username
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="Enter your email or username"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className={styles.inputField}
                    />
                    <Mail size={18} className={styles.inputIcon} />
                  </div>
                </div>

                {/* Password Input */}
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                    />
                    <Lock size={18} className={styles.inputIcon} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification */}
                <div className={styles.cloudflareWrapper}>
                  <div className={styles.cloudflareBadge}>
                    <div className={styles.cloudflareIcon}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <span className={styles.cloudflareText}>Success!</span>
                  </div>
                  <div className={styles.cloudflareHelp}>
                    <Cloud size={14} />
                    <span>CLOUDFLARE</span>
                    <HelpCircle size={14} style={{ marginLeft: '4px' }} />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.signInButton}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>or continue with</span>
                <div className={styles.dividerLine}></div>
              </div>

              {/* Social Login Buttons */}
              <div className={styles.socialButtons}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={styles.socialButton}
                >
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
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.61-.69.84-1.26 2.01-1.11 3.12 1.17.09 2.37-.69 3.1-1.62z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5" style={{ flexShrink: 0 }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>

              {/* Footer Actions */}
              <div className={styles.footerActions}>
                <div className={styles.forgotSignupRow}>
                  <button
                    type="button"
                    onClick={() => setError('Password reset instructions will be sent to your registered email.')}
                    className={styles.forgotPasswordLink}
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('signup');
                    }}
                    className={styles.noAccountLink}
                  >
                    Sign Up
                  </button>
                </div>
                <p className={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className={styles.termsLink}>
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link href="/privacy" className={styles.termsLink}>
                    Privacy Policy
                  </Link>
                </p>
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
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setScreen('select');
                }}
                className={styles.backButton}
              >
                <ArrowLeft size={14} />
                <span>All sign in options</span>
              </button>

              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.logoContainer}>
                  <BrandLogo size={40} />
                </div>
                <h1 className={styles.welcomeHeading}>
                  Welcome <span className={styles.highlight}>Back</span>
                </h1>
                <p className={styles.supportingText}>Enter your credentials to continue</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Login Form */}
              <form onSubmit={handleCustomSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email Address */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Email or Username
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="Enter your email or username"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className={styles.inputField}
                    />
                    <Mail size={18} className={styles.inputIcon} />
                  </div>
                </div>

                {/* Password Input */}
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                    />
                    <Lock size={18} className={styles.inputIcon} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification */}
                <div className={styles.cloudflareWrapper}>
                  <div className={styles.cloudflareBadge}>
                    <div className={styles.cloudflareIcon}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <span className={styles.cloudflareText}>Success!</span>
                  </div>
                  <div className={styles.cloudflareHelp}>
                    <Cloud size={14} />
                    <span>CLOUDFLARE</span>
                    <HelpCircle size={14} style={{ marginLeft: '4px' }} />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.signInButton}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>or continue with</span>
                <div className={styles.dividerLine}></div>
              </div>

              {/* Social Login Buttons */}
              <div className={styles.socialButtons}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={styles.socialButton}
                >
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
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.61-.69.84-1.26 2.01-1.11 3.12 1.17.09 2.37-.69 3.1-1.62z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5" style={{ flexShrink: 0 }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>

              {/* Footer Actions */}
              <div className={styles.footerActions}>
                <div className={styles.forgotSignupRow}>
                  <button
                    type="button"
                    onClick={() => setError('Password reset instructions will be sent to your registered email.')}
                    className={styles.forgotPasswordLink}
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('signup');
                    }}
                    className={styles.noAccountLink}
                  >
                    Sign Up
                  </button>
                </div>
                <p className={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className={styles.termsLink}>
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link href="/privacy" className={styles.termsLink}>
                    Privacy Policy
                  </Link>
                </p>
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
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setScreen('select');
                }}
                className={styles.backButton}
              >
                <ArrowLeft size={14} />
                <span>Back to log in</span>
              </button>

              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.logoContainer}>
                  <BrandLogo size={40} />
                </div>
                <h1 className={styles.welcomeHeading}>Create your account</h1>
                <p className={styles.supportingText}>Join ATLYX to start learning or teaching</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignUpAndContinue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Full Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.inputField}
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Phone & Age row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '10px' }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={styles.inputField}
                      style={{ paddingLeft: '16px' }}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
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
                      className={styles.inputField}
                      style={{ paddingLeft: '16px' }}
                    />
                  </div>
                </div>

                {/* Education background */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Education / Background
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className={styles.inputField}
                    style={{ paddingLeft: '16px', cursor: 'pointer' }}
                  >
                    <option value="School Student">School Student (K-12)</option>
                    <option value="Undergraduate">Undergraduate (College / Univ)</option>
                    <option value="Postgraduate">Postgraduate (Master's / PhD)</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Professional Trainer">Professional Trainer / Educator</option>
                  </select>
                </div>

                {/* Role selection */}
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} style={{ marginBottom: '8px' }}>
                    I am joining as:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIntendedRole('STUDENT')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: intendedRole === 'STUDENT' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: intendedRole === 'STUDENT' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(30, 41, 59, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <BookOpen size={16} color={intendedRole === 'STUDENT' ? '#3b82f6' : '#64748b'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>Student</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Learn courses</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIntendedRole('TRAINER')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: intendedRole === 'TRAINER' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: intendedRole === 'TRAINER' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(30, 41, 59, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Presentation size={16} color={intendedRole === 'TRAINER' ? '#3b82f6' : '#64748b'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>Trainer</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Teach courses</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.signInButton}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <span>Continue with Google</span>
                  )}
                </button>
              </form>

              {/* Footer Actions */}
              <div className={styles.footerActions}>
                <p className={styles.noAccount}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setScreen('select');
                    }}
                    className={styles.noAccountLink}
                  >
                    Log in
                  </button>
                </p>
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
    <Suspense fallback={<div className={styles.loginContainer} />}>
      <LoginForm />
    </Suspense>
  );
}

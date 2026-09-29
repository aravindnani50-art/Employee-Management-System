import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  useGsapContext,
  animateSplitHeading,
  scrambleElementText,
  initCard3DTilt
} from '../animations/gsapUtils';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [shakeCard, setShakeCard] = useState(false);

  const loginStageRef = useRef(null);
  const brandTitleRef = useRef(null);
  const subtitleRef = useRef(null);

  useGsapContext(loginStageRef, ({ q }) => {
    const card = q('.sonar-login-card')[0];
    if (card) {
      initCard3DTilt(card, { maxTilt: 5, scale: 1.01 });
    }
    if (brandTitleRef.current) {
      animateSplitHeading(brandTitleRef.current, { delay: 0.25, duration: 0.8 });
    }
    if (subtitleRef.current) {
      scrambleElementText(subtitleRef.current, 'Internal Employee Management Portal', {
        delay: 0.5,
        duration: 0.95
      });
    }
  }, []);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Subtle mouse-based interactive parallax
  const springConfig = { damping: 25, stiffness: 90 };
  const smoothImgX = useSpring(useMotionValue(0), springConfig);
  const smoothImgY = useSpring(useMotionValue(0), springConfig);
  const smoothOrbX = useSpring(useMotionValue(0), springConfig);
  const smoothOrbY = useSpring(useMotionValue(0), springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const normX = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const normY = (clientY / innerHeight - 0.5) * 2; // -1 to 1

    smoothImgX.set(normX * -6);
    smoothImgY.set(normY * -4);
    smoothOrbX.set(normX * 15);
    smoothOrbY.set(normY * 12);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    setAuthError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      triggerShake();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      setIsSuccess(true);
      showSuccess('Welcome back! Successfully logged into SONAR EMS.');

      // Always navigate to Dashboard upon logging in
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password. Please verify your credentials.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 450);
  };

  // Staggered entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="sonar-login-stage" ref={loginStageRef} onMouseMove={handleMouseMove}>
      {/* Dynamic Ambient Background Layer */}
      <div className="sonar-ambient-layer" aria-hidden="true">
        <motion.div
          className="ambient-orb orb-primary"
          style={{ x: smoothOrbX, y: smoothOrbY }}
        />
        <motion.div
          className="ambient-orb orb-saffron"
          style={{ x: smoothOrbX, y: smoothOrbY }}
        />
        <motion.div className="ambient-orb orb-emerald" />
        <div className="ambient-mesh-grid" />
      </div>

      {/* Unified Panoramic Grid: 30% Login / 70% Team Visual */}
      <div className="sonar-panoramic-container">
        {/* LEFT COLUMN: Integrated Frosted Glass Login Experience (~30%) */}
        <div className="sonar-login-zone">
          {/* Subtle Environmental Decorative Elements from Team Photo */}
          <motion.div
            className="deco-env-badge badge-submitsafe"
            initial={{ opacity: 0, y: -8 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.25, y: 0 }
                : { opacity: 0.25, y: [0, -3, 0] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.5 }
                : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
            }
            aria-hidden="true"
          >
            <div className="deco-badge-icon">
              <Shield size={12} />
            </div>
            <span className="deco-badge-label">SubmitSafe</span>
          </motion.div>

          <motion.div
            className="deco-env-badge badge-roleready"
            initial={{ opacity: 0, y: 8 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.2, y: 0 }
                : { opacity: 0.2, y: [0, 3, 0] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.5 }
                : { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
            }
            aria-hidden="true"
          >
            <div className="deco-badge-icon">
              <CheckCircle2 size={12} />
            </div>
            <span className="deco-badge-label">ROLE READY</span>
          </motion.div>

          {/* Frosted Glass Login Card */}
          <motion.div
            className={`sonar-login-card ${shakeCard ? 'shake-card-active' : ''}`}
            initial={{ opacity: 0, x: -22, scale: 0.98 }}
            animate={{
              opacity: 1,
              x: shakeCard ? [-6, 6, -4, 4, -2, 2, 0] : 0,
              scale: 1
            }}
            transition={{
              duration: shakeCard ? 0.45 : 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: shakeCard ? 0 : 0.1
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="sonar-login-card-inner"
            >
              {/* Header & Brand Reveal */}
              <motion.div variants={itemVariants} className="sonar-brand-header">
                <motion.div
                  className="sonar-brand-badge"
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Building2 size={22} className="sonar-brand-icon" />
                  <span className="sonar-brand-icon-glow" />
                </motion.div>
                <div className="sonar-title-wrap">
                  <h1 ref={brandTitleRef} className="sonar-app-title">SONAR EMS</h1>
                </div>
                <p ref={subtitleRef} className="sonar-app-subtitle">Internal Employee Management Portal</p>
              </motion.div>

              {/* Authentication Error Alert */}
              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div
                    className="sonar-auth-error-alert"
                    role="alert"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <AlertCircle size={16} className="sonar-error-icon" />
                    <span className="sonar-error-text">{authError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="sonar-form" noValidate>
                {/* Work Email Field */}
                <motion.div variants={itemVariants} className="sonar-form-group">
                  <label htmlFor="login-email" className="sonar-label">
                    Work Email
                  </label>
                  <div
                    className={`sonar-input-shell ${errors.email ? 'input-error' : ''}`}
                  >
                    <Mail size={16} className="sonar-field-icon" aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      className="sonar-input"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                        if (authError) setAuthError(null);
                      }}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.span
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sonar-field-error"
                    >
                      {errors.email}
                    </motion.span>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="sonar-form-group">
                  <label htmlFor="login-password" className="sonar-label">
                    Password
                  </label>
                  <div
                    className={`sonar-input-shell ${errors.password ? 'input-error' : ''}`}
                  >
                    <Lock size={16} className="sonar-field-icon" aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="sonar-input sonar-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                        if (authError) setAuthError(null);
                      }}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="sonar-password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {showPassword ? (
                          <motion.span
                            key="eye-off"
                            initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                            transition={{ duration: 0.16 }}
                            className="toggle-icon-wrap"
                          >
                            <EyeOff size={16} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="eye"
                            initial={{ opacity: 0, scale: 0.7, rotate: 20 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.7, rotate: -20 }}
                            transition={{ duration: 0.16 }}
                            className="toggle-icon-wrap"
                          >
                            <Eye size={16} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  {errors.password && (
                    <motion.span
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sonar-field-error"
                    >
                      {errors.password}
                    </motion.span>
                  )}
                </motion.div>

                {/* Keep Signed In Row */}
                <motion.div variants={itemVariants} className="sonar-checkbox-row">
                  <label className="sonar-checkbox-label">
                    <input
                      type="checkbox"
                      className="sonar-checkbox-input"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="sonar-checkbox-custom" aria-hidden="true" />
                    <span className="sonar-checkbox-text">Keep me signed in</span>
                  </label>
                </motion.div>

                {/* Submit Button with Multi-State Animation */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    className={`sonar-btn-submit ${isSuccess ? 'btn-success-state' : ''}`}
                    disabled={isSubmitting || isSuccess}
                    whileHover={!isSubmitting && !isSuccess ? { scale: 1.015, y: -2 } : {}}
                    whileTap={!isSubmitting && !isSuccess ? { scale: 0.96 } : {}}
                    transition={{ duration: 0.15 }}
                  >
                    <AnimatePresence mode="wait">
                      {isSuccess ? (
                        <motion.span
                          key="success"
                          className="btn-content-flex"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckCircle2 size={16} className="btn-icon-spin" />
                          <span>Access Granted • Entering Portal...</span>
                        </motion.span>
                      ) : isSubmitting ? (
                        <motion.span
                          key="submitting"
                          className="btn-content-flex"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="sonar-spinner" aria-hidden="true" />
                          <span>Authenticating...</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          className="btn-content-flex"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span>Sign In to Portal</span>
                          <ArrowRight size={16} className="sonar-btn-arrow" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </form>

              {/* Footer Security Notice */}
              <motion.div variants={itemVariants} className="sonar-card-footer">
                <p className="sonar-security-notice">
                  <ShieldCheck size={13} className="sonar-security-icon" />
                  <span>SONAR Enterprise Management System • Authorized Personnel Only</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Integrated Team Visual Viewport (~70%) */}
        <div className="sonar-image-viewport">
          <div className="sonar-image-parallax-wrapper">
            <motion.img
              src="/assets/team-sonar.jpg"
              alt="SONAR Team Office Celebration"
              className="sonar-team-image"
              loading="eager"
              style={{ x: smoothImgX, y: smoothImgY }}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Seamless Edge Feathering (Gentle 80px dissolve to #0a1124 - NO LINE, NO HIDDEN PEOPLE) */}
          <div className="sonar-blend-feather" aria-hidden="true" />
          <div className="sonar-blend-gradient-y" aria-hidden="true" />

          {/* Floating Team Pill Badge (Bottom Right) */}
          <motion.div
            className="sonar-image-badge"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
          >
            <span className="badge-pulse-dot" />
            <span className="badge-text">SONAR Technologies • Engineering, Operations & Culture</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

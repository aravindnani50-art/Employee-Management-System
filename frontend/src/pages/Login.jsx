import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, demoCredentials, isAuthenticated } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password, rememberMe);
      showSuccess('Welcome back! Successfully logged into WorkPulse.');
      const targetPath = location.state?.from?.pathname || '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setErrors({});
    setAuthError(null);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showInfo(`Demo Account Access: Email is "${demoCredentials.email}", password is "${demoCredentials.password}".`);
  };

  return (
    <div className="login-viewport">
      <motion.div
        className="login-card-container"
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <Building2 size={28} className="login-logo-icon" />
          </div>
          <h1 className="login-app-title">WorkPulse EMS</h1>
          <p className="login-app-subtitle">Internal Employee Management Portal</p>
        </div>

        {/* Demo Credentials Quick Fill Box */}
        <div className="demo-credentials-banner">
          <div className="demo-credentials-info">
            <ShieldCheck size={16} className="demo-shield-icon" />
            <span>
              Demo Login: <strong>{demoCredentials.email}</strong> / <strong>{demoCredentials.password}</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn-demo-autofill"
            onClick={handleFillDemo}
            title="Auto-fill demo credentials"
          >
            <Check size={14} />
            <span>Auto-fill</span>
          </button>
        </div>

        {/* Global Auth Error Alert */}
        {authError && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle size={18} className="auth-error-icon" />
            <span className="auth-error-text">{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Work Email
            </label>
            <div className={`input-icon-wrapper ${errors.email ? 'input-has-error' : ''}`}>
              <Mail size={18} className="field-icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && <span className="field-error-msg">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <a
                href="#forgot"
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot password?
              </a>
            </div>
            <div className={`input-icon-wrapper ${errors.password ? 'input-has-error' : ''}`}>
              <Lock size={18} className="field-icon" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error-msg">{errors.password}</span>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="form-checkbox-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={18} className="btn-arrow-icon" />
              </>
            )}
          </button>
        </form>

        {/* Footer Notice */}
        <div className="login-footer">
          <p className="login-security-notice">
            🔒 Protected enterprise portal. Powered by Express, Prisma & PostgreSQL.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

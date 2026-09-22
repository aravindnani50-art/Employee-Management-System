import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Server,
  ShieldAlert,
  Sun,
  Moon,
  Check,
  Building,
  Database,
  Info
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

  return (
    <div className="settings-page-container">
      <div className="directory-header-row">
        <div>
          <h2 className="directory-heading">Portal Settings & Preferences</h2>
          <p className="directory-subheading">
            Manage your account identity, theme configuration, and view system specifications
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile Card */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="settings-card-header">
            <div className="settings-icon-badge">
              <User size={20} className="icon-accent" />
            </div>
            <div>
              <h3 className="settings-card-title">User Account</h3>
              <p className="settings-card-desc">Active authenticated portal session</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="settings-profile-row">
              <Avatar name={user?.name || 'Admin'} size="lg" />
              <div className="profile-text">
                <h4 className="profile-display-name">{user?.name || 'Administrator'}</h4>
                <span className="profile-display-role">{user?.role || 'Portal Administrator'}</span>
                <span className="profile-display-email">{user?.email || 'admin@workpulse.com'}</span>
              </div>
            </div>

            <div className="settings-form-preview">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.name || 'Alex Morgan'}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || 'admin@workpulse.com'}
                  disabled
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appearance & Theming */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
        >
          <div className="settings-card-header">
            <div className="settings-icon-badge">
              <Palette size={20} className="icon-accent" />
            </div>
            <div>
              <h3 className="settings-card-title">Theme & Appearance</h3>
              <p className="settings-card-desc">Customize your interface visual preference</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="theme-options-grid">
              {/* Light Theme Card */}
              <button
                type="button"
                className={`theme-select-card ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-card-icon light">
                  <Sun size={24} />
                </div>
                <div className="theme-card-label">
                  <span className="theme-name">Light Theme</span>
                  <span className="theme-sub">Crisp contrast, daytime mode</span>
                </div>
                {theme === 'light' && (
                  <div className="theme-check-badge">
                    <Check size={14} />
                  </div>
                )}
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                className={`theme-select-card ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-card-icon dark">
                  <Moon size={24} />
                </div>
                <div className="theme-card-label">
                  <span className="theme-name">Dark Theme</span>
                  <span className="theme-sub">Low glare, nighttime mode</span>
                </div>
                {theme === 'dark' && (
                  <div className="theme-check-badge">
                    <Check size={14} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* System & Architecture Info */}
        <motion.div
          className="settings-card span-two"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="settings-card-header">
            <div className="settings-icon-badge">
              <Server size={20} className="icon-accent" />
            </div>
            <div>
              <h3 className="settings-card-title">System & Stack Architecture</h3>
              <p className="settings-card-desc">Connected infrastructure specifications</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="system-specs-grid">
              <div className="spec-box">
                <span className="spec-label">Backend API URL</span>
                <span className="spec-value code-font">{apiBaseUrl}</span>
              </div>
              <div className="spec-box">
                <span className="spec-label">Database</span>
                <span className="spec-value">PostgreSQL 18 (Prisma ORM)</span>
              </div>
              <div className="spec-box">
                <span className="spec-label">Frontend Stack</span>
                <span className="spec-value">React 18, Vite, Framer Motion</span>
              </div>
              <div className="spec-box">
                <span className="spec-label">Auth Layer Architecture</span>
                <span className="spec-value text-accent">Isolated Demo Session (JWT-ready)</span>
              </div>
            </div>

            <div className="auth-disclosure-box">
              <ShieldAlert size={18} className="disclosure-icon" />
              <div className="disclosure-content">
                <h5 className="disclosure-title">Authentication Architecture Note</h5>
                <p className="disclosure-text">
                  This application implements an isolated, client-side demo authentication provider to maintain compatibility with the existing stateless backend without disrupting working CRUD APIs. The architecture is cleanly decoupled in <code>src/auth/</code> and is prepared to drop in standard JWT or session-based server verification.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

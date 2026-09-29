import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Server,
  ShieldCheck,
  Sun,
  Moon,
  Check,
  Type,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EmployeeAvatar from '../components/common/EmployeeAvatar';

export default function Settings() {
  const { user } = useAuth();
  const {
    theme,
    isDark,
    setTheme,
    palette,
    setPalette,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    fontStyle,
    setFontStyle,
    palettes,
    fonts,
    fontSizes,
    fontStyles
  } = useTheme();

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

  return (
    <div className="settings-page-container">
      <div className="directory-header-row">
        <div>
          <h2 className="directory-heading">Portal Settings & Preferences</h2>
          <p className="directory-subheading">
            Manage your account identity, theme color palettes, and typography font configurations
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
              <div className="sonar-avatar-beacon-wrap">
                <EmployeeAvatar employee={user} name={user?.name || 'Sonar Admin'} size="lg" />
                <span className="sonar-avatar-beacon-ring" />
              </div>
              <div className="profile-text">
                <h4 className="profile-display-name">{user?.name || 'Sonar Admin'}</h4>
                <span className="profile-display-role">{user?.role || 'System Administrator'}</span>
                <span className="profile-display-email">{user?.email || 'Sonar@team.com'}</span>
              </div>
            </div>

            <div className="settings-form-preview">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.name || 'Sonar Admin'}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || 'Sonar@team.com'}
                  disabled
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Color Palette & Mode Card */}
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
              <p className="settings-card-desc">Customize theme palette and light/dark interface mode</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Mode Selector */}
            <div className="mode-toggle-pills-row" style={{ marginBottom: '1.25rem' }}>
              <motion.button
                type="button"
                className={`mode-pill-btn ${!isDark ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sun size={16} />
                <span>Light Mode</span>
                {!isDark && <CheckCircle2 size={15} className="pill-check" />}
              </motion.button>
              <motion.button
                type="button"
                className={`mode-pill-btn ${isDark ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Moon size={16} />
                <span>Dark Mode</span>
                {isDark && <CheckCircle2 size={15} className="pill-check" />}
              </motion.button>
            </div>

            {/* Palettes Grid */}
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Color Palettes ({palettes.length} Presets)
            </label>
            <div className="palette-cards-grid">
              {palettes.map((p) => {
                const isSelected = p.id === palette;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    className={`palette-swatch-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPalette(p.id)}
                    whileHover={{ scale: 1.025, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="swatch-color-pills">
                      <span className="color-circle" style={{ backgroundColor: p.primary }} />
                      <span className="color-circle" style={{ backgroundColor: p.accent }} />
                      <span
                        className="color-circle bg-dot"
                        style={{ backgroundColor: p.previewBg, border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </div>
                    <div className="swatch-text-block">
                      <span className="swatch-title">{p.name}</span>
                      <span className="swatch-desc">{p.description}</span>
                    </div>
                    {isSelected && (
                      <div className="swatch-active-check">
                        <Check size={13} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Typography & Font Customization Studio Card */}
        <motion.div
          className="settings-card span-two"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.2 }}
        >
          <div className="settings-card-header">
            <div className="settings-icon-badge">
              <Type size={20} className="icon-accent" />
            </div>
            <div>
              <h3 className="settings-card-title">Typography & Font Styling</h3>
              <p className="settings-card-desc">Select typeface family and text size proportions</p>
            </div>
          </div>

          <div className="settings-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Font Family Selection */}
            <div>
              <div className="customizer-section-header" style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Font Family</label>
                <span className="section-badge">{fonts.find((f) => f.id === fontFamily)?.name}</span>
              </div>
              <div className="font-options-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {fonts.map((f) => {
                  const isSelected = f.id === fontFamily;
                  return (
                    <motion.button
                      key={f.id}
                      type="button"
                      className={`font-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFontFamily(f.id)}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ fontFamily: f.fontFamily }}
                    >
                      <div className="font-card-top">
                        <span className="font-family-title">{f.name}</span>
                        <span className="font-category-tag">{f.category}</span>
                      </div>
                      <p className="font-sample-preview" style={{ fontFamily: f.fontFamily }}>
                        Aa Bb Cc 123 • Clean SaaS Typography
                      </p>
                      {isSelected && (
                        <div className="font-active-indicator">
                          <Check size={13} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Font Styling & Posture */}
            <div>
              <div className="customizer-section-header" style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Font Styling & Posture</label>
                <span className="section-badge">{fontStyles.find((st) => st.id === fontStyle)?.name}</span>
              </div>
              <div className="fontstyle-cards-row">
                {fontStyles.map((st) => {
                  const isSelected = st.id === fontStyle;
                  return (
                    <motion.button
                      key={st.id}
                      type="button"
                      className={`fontstyle-pill-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFontStyle(st.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="fontstyle-label">{st.label}</span>
                      <span
                        className={`fontstyle-sample ${
                          st.id === 'italic'
                            ? 'italic-sample'
                            : st.id === 'bold'
                            ? 'bold-sample'
                            : st.id === 'bold-italic'
                            ? 'bold-italic-sample'
                            : st.id === 'cursive'
                            ? 'cursive-sample'
                            : ''
                        }`}
                      >
                        {st.sample}
                      </span>
                      <span className="fontstyle-desc">{st.desc}</span>
                      {isSelected && (
                        <div className="fontsize-check">
                          <Check size={12} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Proportions */}
            <div>
              <div className="customizer-section-header" style={{ marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Font Size & Density</label>
                <span className="section-badge">{fontSizes.find((s) => s.id === fontSize)?.sizeName}</span>
              </div>
              <div className="fontsize-cards-row">
                {fontSizes.map((s) => {
                  const isSelected = s.id === fontSize;
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      className={`fontsize-pill-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFontSize(s.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="fontsize-label">{s.label}</span>
                      <span className="fontsize-size">{s.sizeName}</span>
                      <span className="fontsize-desc">{s.desc}</span>
                      {isSelected && (
                        <div className="fontsize-check">
                          <Check size={12} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="customizer-live-preview-box">
              <div className="preview-box-header">
                <span className="preview-tag">LIVE INTERFACE PREVIEW</span>
                <span className="preview-status-pill">Active Configuration</span>
              </div>
              <div className="preview-box-card">
                <div className="preview-left">
                  <span className="preview-welcome">Welcome back, {user?.name || 'Administrator'}</span>
                  <p className="preview-desc">
                    Your workforce metrics and active personnel records are synchronized in real time.
                  </p>
                </div>
                <div className="preview-right">
                  <button type="button" className="btn btn-primary btn-sm">
                    <span>Primary Action</span>
                  </button>
                  <span className="badge badge-active">Active Pro</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System & Architecture Info */}
        <motion.div
          className="settings-card span-two"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.2 }}
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
                <span className="spec-value">React 18, Vite, Framer Motion, GSAP</span>
              </div>
              <div className="spec-box">
                <span className="spec-label">Auth Layer Architecture</span>
                <span className="spec-value text-accent">SONAR EMS Session Security</span>
              </div>
            </div>

            <div className="auth-disclosure-box">
              <ShieldCheck size={18} className="disclosure-icon" />
              <div className="disclosure-content">
                <h5 className="disclosure-title">Authentication & Access Control</h5>
                <p className="disclosure-text">
                  Session authenticated for <strong>Sonar@team.com</strong>. All administration routes are protected with route-level validation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

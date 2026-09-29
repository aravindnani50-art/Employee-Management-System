import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Palette,
  Type,
  Sun,
  Moon,
  Check,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Italic
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeCustomizerModal({ isOpen, onClose }) {
  const {
    theme,
    isDark,
    toggleTheme,
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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleResetDefaults = () => {
    setPalette('sonar');
    setFontFamily('jakarta');
    setFontStyle('normal');
    setFontSize('small');
    setTheme('dark');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="theme-modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="theme-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          >
            {/* Modal Header */}
            <div className="theme-modal-header">
              <div className="theme-modal-header-meta">
                <div className="theme-modal-icon-badge">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="theme-modal-title">Theme & Typography Customizer</h3>
                  <p className="theme-modal-desc">Personalize color palette, font styles, and information density</p>
                </div>
              </div>
              <div className="theme-modal-header-actions">
                <motion.button
                  type="button"
                  className="btn-customizer-reset"
                  onClick={handleResetDefaults}
                  title="Reset to recommended defaults"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={13} />
                  <span>Reset</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="theme-modal-close-btn"
                  onClick={onClose}
                  aria-label="Close customizer"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="theme-modal-body">
              {/* Section 1: Color Palettes */}
              <div className="customizer-section">
                <div className="customizer-section-header">
                  <div className="section-title-wrap">
                    <Palette size={16} className="text-primary" />
                    <h4>Color Palette</h4>
                  </div>
                  <span className="section-badge">{palettes.find((p) => p.id === palette)?.name}</span>
                </div>
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

              {/* Section 2: Appearance Mode (Light / Dark) */}
              <div className="customizer-section">
                <div className="customizer-section-header">
                  <div className="section-title-wrap">
                    <Sun size={16} className="text-primary" />
                    <h4>Interface Mode</h4>
                  </div>
                  <span className="section-badge">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="mode-toggle-pills-row">
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
              </div>

              {/* Section 3: Font Family */}
              <div className="customizer-section">
                <div className="customizer-section-header">
                  <div className="section-title-wrap">
                    <Type size={16} className="text-primary" />
                    <h4>Typography Font Family</h4>
                  </div>
                  <span className="section-badge">{fonts.find((f) => f.id === fontFamily)?.name}</span>
                </div>
                <div className="font-options-grid">
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

              {/* Section 4: Font Styling & Posture (Italic, Bold, Cursive, Normal) */}
              <div className="customizer-section">
                <div className="customizer-section-header">
                  <div className="section-title-wrap">
                    <Italic size={16} className="text-primary" />
                    <h4>Font Styling & Posture</h4>
                  </div>
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

              {/* Section 5: Font Sizing & Information Density */}
              <div className="customizer-section">
                <div className="customizer-section-header">
                  <div className="section-title-wrap">
                    <Sparkles size={16} className="text-primary" />
                    <h4>Font Size Proportions</h4>
                  </div>
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

              {/* Live Preview Snippet Card */}
              <div className="customizer-live-preview-box">
                <div className="preview-box-header">
                  <span className="preview-tag">LIVE INTERFACE PREVIEW</span>
                  <span className="preview-status-pill">Active Configuration</span>
                </div>
                <div className="preview-box-card">
                  <div className="preview-left">
                    <span className="preview-welcome">Welcome back, Administrator</span>
                    <p className="preview-desc">
                      Your workforce metrics and active personnel records are synchronized.
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

            {/* Modal Footer */}
            <div className="theme-modal-footer">
              <span className="theme-footer-hint">Settings are saved automatically to local storage.</span>
              <motion.button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Apply & Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

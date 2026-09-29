import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const value = {
    showToast,
    showSuccess: (msg) => showToast(msg, 'success'),
    showError: (msg) => showToast(msg, 'error', 5000),
    showWarning: (msg) => showToast(msg, 'warning', 4500),
    showInfo: (msg) => showToast(msg, 'info', 4000),
    removeToast
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon success" size={20} aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="toast-icon error" size={20} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="toast-icon warning" size={20} aria-hidden="true" />;
      default:
        return <Info className="toast-icon info" size={20} aria-hidden="true" />;
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`toast-item toast-${toast.type}`}
              initial={{ opacity: 0, x: 30, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.92 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              layout
            >
              <motion.div
                className="toast-icon-wrapper"
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.05 }}
              >
                {getIcon(toast.type)}
              </motion.div>
              <p className="toast-message">{toast.message}</p>
              <motion.button
                type="button"
                className="toast-close-btn"
                onClick={() => removeToast(toast.id)}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </motion.button>
              {toast.duration > 0 && (
                <motion.div
                  className="toast-progress-bar"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <motion.div
      className="error-container"
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="error-icon-wrapper" aria-hidden="true">
        <AlertCircle size={22} className="error-icon" />
      </div>
      <div className="error-content">
        <h4 className="error-title">Something went wrong</h4>
        <p className="error-message">
          {message || 'Unable to connect to the backend service. Please ensure the server is running.'}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-retry"
          onClick={onRetry}
          aria-label="Retry loading data"
        >
          <RotateCw size={15} className="spin-on-hover" />
          <span>Retry</span>
        </button>
      )}
    </motion.div>
  );
}

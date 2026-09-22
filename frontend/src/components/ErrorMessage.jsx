import React from 'react';

/**
 * ErrorMessage component
 * Displays friendly error feedback when network or server operations fail.
 * Provides a "Retry" button to re-trigger failed requests.
 * 
 * @param {Object} props
 * @param {string} props.message - The error message to display
 * @param {Function} [props.onRetry] - Callback invoked when the user clicks Retry
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">Something went wrong</h4>
        <p className="error-message">
          {message || 'Unable to connect to the service. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-retry"
          onClick={onRetry}
          aria-label="Retry operation"
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}

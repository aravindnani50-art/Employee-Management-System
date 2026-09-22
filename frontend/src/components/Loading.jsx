import React from 'react';

/**
 * Loading indicator component
 * Displays a clean spinner and an informative message while asynchronous requests are pending.
 * 
 * @param {Object} props
 * @param {string} [props.message="Loading employees..."] - Informational loading text
 */
export default function Loading({ message = 'Loading employees...' }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

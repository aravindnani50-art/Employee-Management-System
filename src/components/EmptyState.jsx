import React from 'react';

/**
 * EmptyState component
 * Rendered when no records are returned by the backend API.
 * 
 * @param {Object} props
 * @param {string} [props.title="No employees found"] - Heading message
 * @param {string} [props.message="There are no employee records matching your criteria."] - Descriptive message
 * @param {React.ReactNode} [props.action] - Optional button or action link
 */
export default function EmptyState({
  title = 'No employees found',
  message = 'There are no employee records matching your criteria.',
  action = null
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">📋</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

import React from 'react';

/**
 * ConfirmModal component
 * Displays a clean confirmation dialog before destructive actions like deleting an employee.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation prompt message
 * @param {boolean} props.isDeleting - Loading state while delete API request is in progress
 * @param {Function} props.onConfirm - Callback when user confirms
 * @param {Function} props.onCancel - Callback when user cancels
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this employee record? This action cannot be undone.',
  isDeleting = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card modal-confirm">
        <div className="modal-header">
          <h3 className="modal-title text-danger">⚠️ {title}</h3>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting employee...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal component
 * Displays an accessible, animated confirmation dialog before destructive actions.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this employee record? This action cannot be undone.',
  isDeleting = false,
  confirmText = 'Yes, Delete',
  onConfirm,
  onCancel
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="modal-card modal-confirm"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <motion.span
                  className="modal-icon-danger"
                  animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <AlertTriangle size={20} aria-hidden="true" />
                </motion.span>
                <h3 id="modal-title" className="modal-title text-danger">
                  {title}
                </h3>
              </div>
              <motion.button
                type="button"
                className="btn-modal-close"
                onClick={onCancel}
                disabled={isDeleting}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="modal-body">
              <p className="confirm-message">{message}</p>
            </div>

            <div className="modal-footer">
              <motion.button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={isDeleting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={isDeleting}
                whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)' }}
                whileTap={{ scale: 0.96 }}
              >
                {isDeleting ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  confirmText
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

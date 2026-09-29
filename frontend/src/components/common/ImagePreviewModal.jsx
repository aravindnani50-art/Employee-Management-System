import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2, Move } from 'lucide-react';
import EmployeeAvatar from './EmployeeAvatar';
import { Draggable, gsap } from '../../animations/gsapUtils';

/**
 * ImagePreviewModal Component
 * 
 * Displays the full employee photo occupying the entire card area,
 * with a clean header at the top showing their profile photo avatar, name, role, and close button.
 * Enhanced with GSAP Draggable + Inertia for physics-based pan and drag exploration.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {string} props.imageUrl - URL of the employee photo
 * @param {string} [props.employeeName] - Employee name
 * @param {string} [props.employeeTitle] - Employee designation / role
 * @param {Object} [props.employee] - Employee object for header avatar
 */
export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  employeeName = 'Employee',
  employeeTitle = '',
  employee
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const bodyRef = useRef(null);
  const draggableInstanceRef = useRef(null);

  // Reset loading/error states whenever imageUrl or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
      if (imgRef.current) {
        gsap.set(imgRef.current, { x: 0, y: 0 });
      }
    }
  }, [imageUrl, isOpen]);

  // Initialize Draggable with Inertia once image is loaded
  useEffect(() => {
    if (!isOpen || !imageLoaded || !imgRef.current || !bodyRef.current) return;

    try {
      const instances = Draggable.create(imgRef.current, {
        type: 'x,y',
        inertia: true,
        bounds: bodyRef.current,
        edgeResistance: 0.7,
        cursor: 'grab',
        activeCursor: 'grabbing',
        zIndexBoost: false
      });
      draggableInstanceRef.current = instances[0] || null;
    } catch {
      // Draggable fallback gracefully if container measurements pending
    }

    return () => {
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.kill();
        draggableInstanceRef.current = null;
      }
    };
  }, [isOpen, imageLoaded]);

  // Handle Escape key and lock body scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="image-preview-backdrop"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo preview for ${employeeName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="image-preview-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header: Profile Photo Avatar, Name, Role & Close Button */}
            <div className="image-preview-header">
              <div className="image-preview-user-meta">
                <EmployeeAvatar
                  employee={employee}
                  src={imageUrl}
                  name={employeeName}
                  size="sm"
                  className="preview-header-avatar"
                />
                <div className="image-preview-title-wrap">
                  <h3 className="image-preview-name">{employeeName}</h3>
                  {employeeTitle && (
                    <span className="image-preview-role">{employeeTitle}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="image-preview-close-btn"
                onClick={onClose}
                aria-label="Close photo preview"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body / Image Stage: Photo occupies the whole card area */}
            <div className="image-preview-body" ref={bodyRef}>
              {!imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="image-preview-spinner-wrap">
                      <Loader2 size={32} className="spin-animate text-primary" />
                      <span className="image-preview-spinner-text">Loading photo...</span>
                    </div>
                  )}
                  <motion.img
                    ref={imgRef}
                    src={imageUrl}
                    alt={`${employeeName}'s profile photo`}
                    className={`image-preview-img ${imageLoaded ? 'is-visible' : 'is-hidden'}`}
                    title={imageLoaded ? 'Click and drag to pan photo • Double click to center' : undefined}
                    onDoubleClick={() => {
                      if (imgRef.current) {
                        gsap.to(imgRef.current, { x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                  />
                </>
              ) : (
                <div className="image-preview-error-card">
                  <AlertCircle size={40} className="preview-error-icon text-danger" />
                  <h4 className="preview-error-title">Unable to Load Image</h4>
                  <p className="preview-error-desc">
                    The employee photo could not be loaded or is unavailable.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onClose}
                  >
                    Close Preview
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

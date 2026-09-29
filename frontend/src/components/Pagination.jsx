import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowUp, Check } from 'lucide-react';
import { gsap, smoothScrollTo } from '../animations/gsapUtils';

/**
 * Premium SONAR EMS Redesigned Bottom Navigation Bar
 * 
 * Features:
 * - Cohesive dark glass surface with subtle cyan/blue accents and soft ambient glow
 * - GSAP numeric counter animation for dynamic count ("Showing 1–10 of 26 employees")
 * - Framer Motion compact glass per-page dropdown with smooth open/close and hover lift
 * - Connected animated pagination track with Framer Motion spring layoutId active pill
 * - Directional hover interactions for Previous and Next arrows
 * - Compact animated "Back to Top" control revealed on scroll with GSAP ScrollTo
 * - Framer Motion staggered entrance animation
 * - GSAP continuous subtle breathing micro-animation on active indicator aura
 * - Full responsive layout for desktop, laptop, tablet, and mobile with zero overflow
 * - Reduced motion support & clean GSAP lifecycle cleanup
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalRecords,
  totalItems,
  currentCount,
  limit = 10,
  onPageChange,
  onLimitChange
}) {
  const total = totalRecords !== undefined ? totalRecords : (totalItems !== undefined ? totalItems : 0);
  const pages = Math.max(1, totalPages || Math.ceil(total / limit) || 1);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pages;

  // Calculate range of records currently displayed
  let startRecord = 0;
  let endRecord = 0;

  if (total > 0) {
    startRecord = (currentPage - 1) * limit + 1;
    if (currentCount !== undefined && currentCount !== null && currentCount > 0) {
      endRecord = (currentPage - 1) * limit + currentCount;
    } else {
      endRecord = Math.min(currentPage * limit, total);
    }
    startRecord = Math.min(startRecord, total);
    endRecord = Math.min(endRecord, total);
  }

  // Generate pagination page numbers sequence with smart ellipsis
  const getPageNumbers = () => {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', pages];
    }
    if (currentPage >= pages - 3) {
      return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', pages];
  };

  const pageNumbers = getPageNumbers();

  // 1. GSAP Numeric Counter Animation
  const startNumRef = useRef(null);
  const endNumRef = useRef(null);
  const totalNumRef = useRef(null);
  const prevCountsRef = useRef({ start: 0, end: 0, total: 0 });

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (startNumRef.current) startNumRef.current.textContent = startRecord;
      if (endNumRef.current) endNumRef.current.textContent = endRecord;
      if (totalNumRef.current) totalNumRef.current.textContent = total;
      prevCountsRef.current = { start: startRecord, end: endRecord, total };
      return;
    }

    const state = {
      start: prevCountsRef.current.start,
      end: prevCountsRef.current.end,
      total: prevCountsRef.current.total
    };

    const tween = gsap.to(state, {
      start: startRecord,
      end: endRecord,
      total: total,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => {
        if (startNumRef.current) startNumRef.current.textContent = Math.round(state.start);
        if (endNumRef.current) endNumRef.current.textContent = Math.round(state.end);
        if (totalNumRef.current) totalNumRef.current.textContent = Math.round(state.total);
      },
      onComplete: () => {
        prevCountsRef.current = { start: startRecord, end: endRecord, total };
      }
    });

    return () => {
      tween.kill();
    };
  }, [startRecord, endRecord, total]);

  // 2. Per-Page Dropdown State & Click-Outside Handling
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 3. Back to Top Scroll Listener & GSAP Handler
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    try {
      smoothScrollTo(0, { duration: 0.75, offsetY: 0, ease: 'power3.inOut' });
    } catch {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 4. GSAP Micro-Animation on Active Pagination Indicator
  const activeGlowRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !activeGlowRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(activeGlowRef.current, {
        boxShadow: '0 0 16px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(56, 189, 248, 0.3)',
        opacity: 0.9,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, activeGlowRef);

    return () => ctx.revert();
  }, [currentPage]);

  // 5. Framer Motion Entrance Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.06,
        delayChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.nav
      className="sonar-bottom-control-bar"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Pagination Navigation"
    >
      {/* LEFT SECTION: Dynamic Count Display & Per-Page Glass Dropdown */}
      <div className="sonar-bottom-left">
        {/* Dynamic Count Display with GSAP Animated Numbers */}
        <motion.div variants={itemVariants} className="sonar-count-badge">
          <span className="sonar-radar-dot" aria-hidden="true" />
          <div className="sonar-count-text">
            <span>Showing </span>
            <strong className="sonar-count-num" ref={startNumRef}>
              {startRecord}
            </strong>
            <span>–</span>
            <strong className="sonar-count-num" ref={endNumRef}>
              {endRecord}
            </strong>
            <span> of </span>
            <strong className="sonar-count-num total-highlight" ref={totalNumRef}>
              {total}
            </strong>
            <span> employees</span>
          </div>
        </motion.div>

        {/* Per-Page Glass Dropdown Control */}
        {onLimitChange && (
          <motion.div variants={itemVariants} className="sonar-perpage-control" ref={dropdownRef}>
            <span className="sonar-perpage-label">Per page</span>
            <motion.button
              type="button"
              className={`sonar-perpage-trigger ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-label={`Select records per page, currently ${limit}`}
            >
              <span>{limit}</span>
              <motion.span
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="dropdown-chevron-icon"
              >
                <ChevronDown size={13} />
              </motion.span>
            </motion.button>

            {/* Floating Glass Dropdown Menu (Opens Upward to prevent offscreen clip) */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="sonar-perpage-dropdown"
                  role="listbox"
                  initial={{ opacity: 0, y: 6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.94 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  {[5, 10, 20, 50].map((val) => {
                    const isSelected = val === limit;
                    return (
                      <motion.button
                        key={val}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`sonar-dropdown-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onLimitChange(val);
                          setIsDropdownOpen(false);
                        }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>{val}</span>
                        {isSelected && (
                          <motion.span layoutId="dropdownCheck" className="option-check">
                            <Check size={12} />
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* CENTER SECTION: Compact Floating "Back to Top" (Revealed after Scroll) */}
      <div className="sonar-bottom-center">
        <AnimatePresence>
          {showTopBtn && (
            <motion.button
              type="button"
              className="sonar-back-to-top-btn"
              onClick={handleScrollToTop}
              initial={{ opacity: 0, scale: 0.75, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 8 }}
              whileHover="hover"
              whileTap={{ scale: 0.92 }}
              title="Back to Top"
              aria-label="Scroll back to top of employee list"
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                className="top-arrow-icon"
                variants={{
                  hover: { y: -2 }
                }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.55 }}
              >
                <ArrowUp size={13} />
              </motion.span>
              <span className="top-btn-text">Top</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT SECTION: Connected Animated Segmented Pagination Track */}
      <motion.div variants={itemVariants} className="sonar-bottom-right">
        <div className="sonar-pagination-track" role="group" aria-label="Pagination Controls">
          {/* Previous Button with Directional Arrow */}
          <motion.button
            type="button"
            className={`sonar-nav-btn sonar-prev-btn ${isFirstPage ? 'disabled' : ''}`}
            onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            whileHover={!isFirstPage ? 'hover' : undefined}
            whileTap={!isFirstPage ? { scale: 0.93 } : undefined}
            aria-label="Previous page"
          >
            <motion.span
              className="nav-arrow"
              variants={{
                hover: { x: -3 }
              }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </motion.span>
            <span>Previous</span>
          </motion.button>

          <div className="sonar-track-divider" aria-hidden="true" />

          {/* Numbered Page Buttons with Smooth Moving Active Indicator */}
          <div className="sonar-page-numbers-group" role="group" aria-label="Page numbers">
            {pageNumbers.map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="sonar-page-ellipsis" aria-hidden="true">
                    &hellip;
                  </span>
                );
              }

              const isActive = item === currentPage;
              return (
                <motion.button
                  key={`page-${item}`}
                  type="button"
                  className={`sonar-page-num-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onPageChange(item)}
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={`Page ${item}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sonarActivePageIndicator"
                      className="sonar-active-page-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 30
                      }}
                    >
                      <div ref={activeGlowRef} className="sonar-active-glow-aura" />
                    </motion.div>
                  )}
                  <span className="sonar-page-num-label">{item}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="sonar-track-divider" aria-hidden="true" />

          {/* Next Button with Directional Arrow */}
          <motion.button
            type="button"
            className={`sonar-nav-btn sonar-next-btn ${isLastPage ? 'disabled' : ''}`}
            onClick={() => !isLastPage && onPageChange(currentPage + 1)}
            disabled={isLastPage}
            whileHover={!isLastPage ? 'hover' : undefined}
            whileTap={!isLastPage ? { scale: 0.93 } : undefined}
            aria-label="Next page"
          >
            <span>Next</span>
            <motion.span
              className="nav-arrow"
              variants={{
                hover: { x: 3 }
              }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            >
              <ChevronRight size={15} aria-hidden="true" />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { gsap, ScrollToPlugin, smoothScrollTo } from '../../animations/gsapUtils';

export default function FloatingScrollToTop() {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!btnRef.current) return;
    if (visible) {
      gsap.to(btnRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: 'auto',
        duration: 0.35,
        ease: 'back.out(1.8)'
      });
    } else {
      gsap.to(btnRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.85,
        pointerEvents: 'none',
        duration: 0.25,
        ease: 'power2.in'
      });
    }
  }, [visible]);

  const handleClick = () => {
    smoothScrollTo(0, { duration: 0.75, ease: 'power3.inOut' });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className="btn-floating-scroll-top"
      onClick={handleClick}
      title="Scroll to Top"
      aria-label="Scroll to top of page"
      style={{ opacity: 0, pointerEvents: 'none', transform: 'translateY(12px) scale(0.85)' }}
    >
      <ArrowUp size={16} />
      <span>Top</span>
    </button>
  );
}

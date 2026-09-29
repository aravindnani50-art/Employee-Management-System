import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Draggable,
  Observer,
  MotionPathPlugin,
  TextPlugin,
  SplitText,
  ScrambleTextPlugin,
  InertiaPlugin
} from './gsapCore';

/**
 * useIsomorphicLayoutEffect
 * Safely uses useLayoutEffect on client and useEffect on server.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * useGsapContext
 * Scopes all GSAP animations, timelines, ScrollTriggers, and Draggables to a container element.
 * Handles complete lifecycle cleanup on unmount or dependency update.
 * 
 * @param {React.RefObject} scopeRef - Container ref to scope selectors
 * @param {Function} callback - Animation factory receiving ({ context, q })
 * @param {Array} dependencies - React dependency array
 */
export function useGsapContext(scopeRef, callback, dependencies = []) {
  useIsomorphicLayoutEffect(() => {
    if (!scopeRef?.current) return;

    const ctx = gsap.context((context) => {
      // Scoped selector helper
      const q = gsap.utils.selector(scopeRef.current);
      return callback({ context, q, scope: scopeRef.current });
    }, scopeRef);

    return () => ctx.revert();
  }, dependencies);
}

/**
 * animateSplitHeading
 * Splits heading text into characters and plays an elastic 3D perspective cascade.
 * 
 * @param {HTMLElement|string} target 
 * @param {Object} options 
 */
export function animateSplitHeading(target, options = {}) {
  if (!target) return null;
  const {
    type = 'chars,words',
    stagger = 0.028,
    duration = 0.8,
    delay = 0.1,
    ease = 'back.out(1.5)',
    onComplete
  } = options;

  try {
    const split = new SplitText(target, { type, charsClass: 'gsap-split-char', wordsClass: 'gsap-split-word' });
    const chars = split.chars;

    gsap.set(chars, {
      opacity: 0,
      y: 35,
      rotateX: -70,
      transformOrigin: '50% 50% -30px',
      transformPerspective: 600
    });

    const tween = gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger,
      duration,
      delay,
      ease,
      onComplete: () => {
        if (onComplete) onComplete(split);
      }
    });

    return { split, tween };
  } catch (err) {
    console.warn('SplitText animation error:', err);
    return null;
  }
}

/**
 * scrambleElementText
 * High-tech Sonar cyber decoding scramble effect on text elements.
 * 
 * @param {HTMLElement|string} target 
 * @param {string} newText 
 * @param {Object} options 
 */
export function scrambleElementText(target, newText, options = {}) {
  if (!target) return null;
  const {
    chars = '01SONAREMS2468#%!/<>[]',
    duration = 1.1,
    delay = 0,
    speed = 0.35,
    ease = 'power2.out',
    onComplete
  } = options;

  return gsap.to(target, {
    duration,
    delay,
    ease,
    scrambleText: {
      text: newText,
      chars,
      speed,
      revealDelay: 0.15
    },
    onComplete
  });
}

/**
 * animateCounter
 * Smooth mathematical counter tween with custom formatting.
 * 
 * @param {HTMLElement} target 
 * @param {number} endValue 
 * @param {Object} options 
 */
export function animateCounter(target, endValue, options = {}) {
  if (!target) return null;
  const {
    duration = 1.6,
    delay = 0,
    ease = 'power3.out',
    prefix = '',
    suffix = '',
    formatter = (v) => v.toLocaleString()
  } = options;

  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration,
    delay,
    ease,
    roundProps: 'val',
    onUpdate: () => {
      if (target) {
        target.innerText = `${prefix}${formatter(Math.round(obj.val))}${suffix}`;
      }
    }
  });
}

/**
 * initScrollReveal
 * ScrollTrigger batch reveal for child elements.
 * 
 * @param {string|Array<HTMLElement>} targets 
 * @param {Object} options 
 */
export function initScrollReveal(targets, options = {}) {
  const {
    scroller = undefined,
    start = 'top 88%',
    y = 35,
    duration = 0.7,
    stagger = 0.08,
    ease = 'power3.out'
  } = options;

  return ScrollTrigger.batch(targets, {
    scroller,
    start,
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, stagger, ease, overwrite: 'auto' }
      );
    }
  });
}

/**
 * smoothScrollTo
 * Smooth scroll to an element or coordinate using ScrollToPlugin.
 * 
 * @param {string|number|HTMLElement} target 
 * @param {Object} options 
 */
export function smoothScrollTo(target, options = {}) {
  const { duration = 0.85, offsetY = 20, ease = 'power3.inOut' } = options;
  if (typeof window === 'undefined') return;

  gsap.to(window, {
    duration,
    scrollTo: { y: target, offsetY },
    ease
  });
}

/**
 * applyFlipTransition
 * Smooth FLIP animation for layout changes (e.g. employee card grid vs table view).
 * 
 * @param {Object} state 
 * @param {Object} options 
 */
export function applyFlipTransition(state, options = {}) {
  const {
    duration = 0.5,
    ease = 'power2.inOut',
    stagger = 0.03,
    absolute = true,
    onComplete
  } = options;

  return Flip.from(state, {
    duration,
    ease,
    stagger,
    absolute,
    onComplete
  });
}

/**
 * makeElementDraggable
 * Makes an element draggable with Inertia physics and boundary clamping.
 * 
 * @param {HTMLElement|string} target 
 * @param {Object} options 
 */
export function makeElementDraggable(target, options = {}) {
  if (!target || typeof window === 'undefined') return [];
  const {
    type = 'x,y',
    bounds = undefined,
    inertia = true,
    edgeResistance = 0.75,
    cursor = 'grab',
    onDragStart,
    onDrag,
    onDragEnd
  } = options;

  return Draggable.create(target, {
    type,
    bounds,
    inertia,
    edgeResistance,
    cursor,
    activeCursor: 'grabbing',
    onDragStart,
    onDrag,
    onDragEnd
  });
}

/**
 * initCard3DTilt
 * Adds a physical 3D perspective mouse-tracking tilt to any card.
 * 
 * @param {HTMLElement} card 
 * @param {Object} options 
 */
export function initCard3DTilt(card, options = {}) {
  if (!card) return () => {};
  const { maxTilt = 8, scale = 1.02 } = options;

  const setRotateX = gsap.quickTo(card, 'rotationX', { duration: 0.35, ease: 'power2.out' });
  const setRotateY = gsap.quickTo(card, 'rotationY', { duration: 0.35, ease: 'power2.out' });
  const setScale = gsap.quickTo(card, 'scale', { duration: 0.35, ease: 'power2.out' });

  gsap.set(card, { transformPerspective: 900, transformStyle: 'preserve-3d' });

  const onMouseMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1

    setRotateX(-normY * maxTilt);
    setRotateY(normX * maxTilt);
    setScale(scale);
  };

  const onMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);

  return () => {
    card.removeEventListener('mousemove', onMouseMove);
    card.removeEventListener('mouseleave', onMouseLeave);
  };
}

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  Flip,
  Draggable,
  Observer,
  MotionPathPlugin,
  TextPlugin,
  SplitText,
  ScrambleTextPlugin,
  InertiaPlugin
};

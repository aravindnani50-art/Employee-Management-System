import React, { useRef, useEffect, useState } from 'react';
import {
  gsap,
  MotionPathPlugin,
  ScrambleTextPlugin,
  Draggable,
  makeElementDraggable
} from '../../animations/gsapUtils';
import { Activity, Radio, Move, Minimize2, Maximize2 } from 'lucide-react';

/**
 * SonarRadarWidget Component
 * 
 * Signature Sonar EMS visual identity widget showcasing:
 * - GSAP MotionPath circular orbit
 * - Rotating radar sweep line
 * - Concentric SVG wave pulses
 * - ScrambleText real-time telemetry readout
 * - Draggable with Inertia physics
 */
export default function SonarRadarWidget({ isFloating = false, className = '' }) {
  const containerRef = useRef(null);
  const dragHandleRef = useRef(null);
  const beamRef = useRef(null);
  const blipRef1 = useRef(null);
  const blipRef2 = useRef(null);
  const blipRef3 = useRef(null);
  const telemetryTextRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Rotating Radar Sweep Beam
      if (beamRef.current) {
        gsap.to(beamRef.current, {
          rotation: 360,
          transformOrigin: '100px 100px',
          duration: 3.2,
          repeat: -1,
          ease: 'none'
        });
      }

      // 2. MotionPath circular orbital travel for radar blips
      if (blipRef1.current) {
        gsap.to(blipRef1.current, {
          motionPath: {
            path: 'M 100, 30 A 70,70 0 1,0 100.01, 30',
            align: 'self',
            autoRotate: false
          },
          duration: 6,
          repeat: -1,
          ease: 'none'
        });
      }

      if (blipRef2.current) {
        gsap.to(blipRef2.current, {
          motionPath: {
            path: 'M 100, 55 A 45,45 0 1,1 99.99, 55',
            align: 'self',
            autoRotate: false
          },
          duration: 4.5,
          repeat: -1,
          ease: 'none'
        });
      }

      // 3. Concentric radar ring pulses
      gsap.to('.radar-pulse-ring', {
        scale: 1.45,
        opacity: 0,
        transformOrigin: 'center center',
        duration: 2.8,
        repeat: -1,
        stagger: 0.7,
        ease: 'power1.out'
      });

      // 4. ScrambleText telemetry loop
      const telemetryMessages = [
        'SYSTEM: ACTIVE // 100% HEALTH',
        'POSTGRESQL POOL // CONNECTED',
        'SONAR TELEMETRY // TRACKING',
        'NODES SYNCHRONIZED // 60 FPS'
      ];
      let msgIndex = 0;

      const cycleTelemetry = () => {
        if (!telemetryTextRef.current) return;
        msgIndex = (msgIndex + 1) % telemetryMessages.length;
        gsap.to(telemetryTextRef.current, {
          duration: 1.2,
          scrambleText: {
            text: telemetryMessages[msgIndex],
            chars: '01SONAR*#%!',
            speed: 0.3
          },
          onComplete: () => {
            gsap.delayedCall(3, cycleTelemetry);
          }
        });
      };

      gsap.delayedCall(2, cycleTelemetry);

      // 5. Make Draggable with Inertia if floating
      if (isFloating && containerRef.current) {
        Draggable.create(containerRef.current, {
          type: 'x,y',
          handle: dragHandleRef.current || containerRef.current,
          inertia: true,
          edgeResistance: 0.75,
          bounds: window
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isFloating]);

  return (
    <div
      ref={containerRef}
      className={`sonar-radar-widget ${isFloating ? 'floating-telemetry-badge' : ''} ${className}`}
      style={isFloating ? { position: 'fixed', bottom: '24px', left: '24px', zIndex: 99 } : {}}
      role="region"
      aria-label="SONAR Radar Telemetry System"
    >
      <div className="radar-widget-inner">
        {/* Header / Drag Bar */}
        <div ref={dragHandleRef} className="radar-widget-header">
          <div className="radar-status-dot-wrap">
            <span className="radar-live-dot" />
            <span className="radar-title-label">SONAR TELEMETRY</span>
          </div>
          <div className="radar-header-controls">
            {isFloating && (
              <span className="radar-drag-indicator" title="Drag Widget">
                <Move size={12} />
              </span>
            )}
            <button
              type="button"
              className="radar-min-btn"
              onClick={() => setIsMinimized((prev) => !prev)}
              aria-label={isMinimized ? 'Expand telemetry' : 'Minimize telemetry'}
            >
              {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
          </div>
        </div>

        {/* Radar Screen & Telemetry */}
        {!isMinimized && (
          <div className="radar-viewport">
            <svg
              className="radar-svg"
              viewBox="0 0 200 200"
              width="100%"
              height="100%"
            >
              <defs>
                <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.7" />
                </radialGradient>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background circular grid */}
              <circle cx="100" cy="100" r="95" fill="url(#sonarGlow)" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="45" fill="none" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1" />

              {/* Crosshairs */}
              <line x1="100" y1="5" x2="100" y2="195" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" />
              <line x1="5" y1="100" x2="195" y2="100" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" />

              {/* Pulse rings */}
              <circle className="radar-pulse-ring" cx="100" cy="100" r="30" fill="none" stroke="#0ea5e9" strokeOpacity="0.5" strokeWidth="1.5" />
              <circle className="radar-pulse-ring" cx="100" cy="100" r="30" fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.5" />

              {/* Rotating Sweep Beam */}
              <g ref={beamRef}>
                <line x1="100" y1="100" x2="100" y2="5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <path d="M 100,100 L 100,5 A 95,95 0 0,1 167,33 Z" fill="url(#beamGrad)" />
              </g>

              {/* Center emitter */}
              <circle cx="100" cy="100" r="4" fill="#38bdf8" />
              <circle cx="100" cy="100" r="8" fill="none" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1" />

              {/* Orbital Blips (MotionPath targets) */}
              <circle ref={blipRef1} cx="0" cy="0" r="3.5" fill="#10b981" filter="drop-shadow(0 0 4px #10b981)" />
              <circle ref={blipRef2} cx="0" cy="0" r="3" fill="#f59e0b" filter="drop-shadow(0 0 3px #f59e0b)" />
              <circle ref={blipRef3} cx="135" cy="80" r="2.5" fill="#38bdf8" filter="drop-shadow(0 0 3px #38bdf8)" />
            </svg>

            {/* Live ScrambleText readout */}
            <div className="radar-telemetry-readout">
              <Radio size={12} className="telemetry-icon" />
              <span ref={telemetryTextRef} className="telemetry-text">
                SONAR SYSTEM ONLINE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

/**
 * StartupAnimation - Minimal cinematic 3-stage opening for AfterFrame
 * 
 * Stage 1: Full-screen near-black background with subtle centered AF film-frame symbol fade-in.
 * Stage 2: Animate in the editorial serif community line: "Cinema is Better Together" with
 *          subtly larger initial C and T, champagne gold & ivory accents, and balanced tracking.
 * Stage 3: Smooth dissolve transition into the website.
 * 
 * Requirements:
 * - Runs on initial page load and full refresh (not on internal SPA route changes).
 * - Respects prefers-reduced-motion.
 * - Failsafe timer prevents getting stuck.
 * - Completely removes pointer events & unmounts once completed so it never blocks clicks.
 */
export default function StartupAnimation({ onComplete }) {
  const [stage, setStage] = useState(1); // 1 = symbol, 2 = tagline, 3 = fading out, 4 = done
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if already seen in current browser session or if reduced motion is preferred
    const hasSeenSplash = sessionStorage.getItem('af_splash_seen');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasSeenSplash === 'true' || prefersReducedMotion) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }
    try {
      sessionStorage.setItem('af_splash_seen', 'true');
    } catch {}

    // Stage 1 -> Stage 2: Symbol fades in, then Tagline appears at 750ms
    const timerStage2 = setTimeout(() => {
      setStage(2);
    }, 800);

    // Stage 2 -> Stage 3: Tagline displays, then fade out starts at 2200ms
    const timerStage3 = setTimeout(() => {
      setStage(3);
    }, 2200);

    // Stage 3 -> Stage 4: Fade out completes at 2700ms, completely clean up
    const timerDone = setTimeout(() => {
      setStage(4);
      setVisible(false);
      if (onComplete) onComplete();
    }, 2750);

    // Absolute failsafe fallback (max 3.2s) in case of any animation stalls
    const failsafe = setTimeout(() => {
      setStage(4);
      setVisible(false);
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(timerStage2);
      clearTimeout(timerStage3);
      clearTimeout(timerDone);
      clearTimeout(failsafe);
    };
  }, [onComplete]);

  // Allow clicking anywhere to skip immediately
  const handleSkip = () => {
    setStage(4);
    setVisible(false);
    if (onComplete) onComplete();
  };

  if (!visible || stage === 4) return null;

  return (
    <div
      onClick={handleSkip}
      className={`startup-splash-overlay stage-${stage}`}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#070709',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: stage === 3 ? 0 : 1,
        transition: 'opacity 550ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: stage === 3 ? 'none' : 'auto',
        userSelect: 'none',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Subtle background ambient cinema warmth */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.05) 0%, rgba(7, 7, 9, 0) 70%)',
          pointerEvents: 'none',
          transform: 'translateY(-20px)'
        }}
      />

      {/* Stage 1: Centered AF Film-Frame Symbol */}
      <div
        className="startup-symbol-wrap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'startupSymbolFadeIn 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          willChange: 'opacity, transform'
        }}
      >
        <svg
          width="135"
          height="115"
          viewBox="0 0 115 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 4px 20px rgba(245, 197, 24, 0.25))'
          }}
        >
          {/* Film Strip Left Border with Sprocket Holes */}
          <rect x="2" y="5" width="22" height="90" rx="4" fill="#F5C518" />
          <rect x="6" y="12" width="14" height="9" rx="2" fill="#070709" />
          <rect x="6" y="27" width="14" height="9" rx="2" fill="#070709" />
          <rect x="6" y="42" width="14" height="9" rx="2" fill="#070709" />
          <rect x="6" y="57" width="14" height="9" rx="2" fill="#070709" />
          <rect x="6" y="72" width="14" height="9" rx="2" fill="#070709" />

          {/* Top & Right Film Frame Outer Bar */}
          <path
            d="M20 12 H102 C106 12 108 14 108 18 V26 C108 28 106 30 102 30 H32 V12"
            fill="#F5C518"
          />

          {/* 'A' Stem & Crossbar (Ivory) */}
          <path
            d="M38 90 L58 26 H68 L88 90 H76 L72 74 H54 L50 90 H38 Z"
            fill="#F7EFE5"
          />
          {/* 'A' Inner Counter */}
          <polygon points="63,42 56,66 70,66" fill="#070709" />

          {/* 'F' Overlap & Bars (Warm Cinema Gold) */}
          <path
            d="M68 34 H106 V44 H80 V54 H98 V64 H80 V90 H68 Z"
            fill="#F5C518"
          />

          {/* Cinematic Dynamic Horizon Arc */}
          <path
            d="M40 76 Q65 62 102 68"
            stroke="#F5C518"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Stage 2: Community Line with Editorial Serif Typography */}
      <div
        className="startup-tagline-wrap"
        style={{
          marginTop: '2.25rem',
          textAlign: 'center',
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <h2
          style={{
            fontFamily: "'Cinzel', 'Cormorant Garamond', 'Didot', 'Bodoni MT', 'Times New Roman', serif",
            fontWeight: 500,
            fontSize: '1.05rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#F7EFE5',
            margin: 0,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '0.08em',
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)'
          }}
        >
          <span style={{ fontSize: '1.28em', color: '#F5C518', fontWeight: 600 }}>C</span>
          <span>inema is </span>
          <span style={{ fontSize: '1.14em', color: '#F5C518', fontWeight: 600 }}>B</span>
          <span>etter </span>
          <span style={{ fontSize: '1.28em', color: '#F5C518', fontWeight: 600 }}>T</span>
          <span>ogether</span>
        </h2>

        {/* Minimal Subtle Horizon Accent Line (matching reference image) */}
        <div
          style={{
            marginTop: '0.85rem',
            width: '180px',
            height: '1px',
            margin: '0.85rem auto 0 auto',
            background: 'linear-gradient(90deg, transparent 0%, rgba(245, 197, 24, 0.4) 30%, rgba(245, 197, 24, 0.8) 50%, rgba(245, 197, 24, 0.4) 70%, transparent 100%)',
            boxShadow: '0 0 6px rgba(245, 197, 24, 0.3)'
          }}
        />
      </div>

      {/* Subtle Skip Hint in bottom corner */}
      <span
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          color: 'rgba(255, 255, 255, 0.3)',
          textTransform: 'uppercase',
          fontWeight: 500
        }}
      >
        Click anywhere to enter
      </span>

      <style>{`
        @keyframes startupSymbolFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

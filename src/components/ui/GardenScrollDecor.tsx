import React, { useEffect, useState } from 'react';

// ── Scroll progress 0→1 ──────────────────────────────────────────
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return progress;
}

// ── SVG: Bee (slightly smaller) ───────────────────────────────────
const Bee: React.FC = () => (
  <svg width="38" height="43" viewBox="0 0 46 52" fill="none">
    <g style={{ transformBox: 'fill-box', transformOrigin: 'right center',
                 animation: 'beeWingBeat 0.11s linear infinite' }}>
      <ellipse cx="9"  cy="17" rx="11" ry="6"  fill="rgba(186,230,253,0.83)" />
      <ellipse cx="10" cy="23" rx="8"  ry="4"  fill="rgba(186,230,253,0.52)" />
    </g>
    <g style={{ transformBox: 'fill-box', transformOrigin: 'left center',
                 animation: 'beeWingBeat 0.11s linear infinite', animationDelay: '0.055s' }}>
      <ellipse cx="37" cy="17" rx="11" ry="6"  fill="rgba(186,230,253,0.83)" />
      <ellipse cx="36" cy="23" rx="8"  ry="4"  fill="rgba(186,230,253,0.52)" />
    </g>
    <ellipse cx="23" cy="36" rx="9" ry="13" fill="#fbbf24" />
    <rect x="14" y="29" width="18" height="4.5" rx="2" fill="#1c1917" opacity="0.73" />
    <rect x="14" y="36" width="18" height="4.5" rx="2" fill="#1c1917" opacity="0.73" />
    <circle cx="23" cy="20" r="7"   fill="#fbbf24" />
    <circle cx="20.5" cy="19" r="1.6" fill="#1c1917" />
    <circle cx="25.5" cy="19" r="1.6" fill="#1c1917" />
    <circle cx="20.8" cy="18.5" r="0.5" fill="white" />
    <circle cx="25.8" cy="18.5" r="0.5" fill="white" />
    <line x1="21" y1="14" x2="16" y2="6"  stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="15.5" cy="5.5" r="2" fill="#1c1917" />
    <line x1="25" y1="14" x2="30" y2="6"  stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="30.5" cy="5.5" r="2" fill="#1c1917" />
  </svg>
);

// ── SVG: Butterfly (slightly smaller) ────────────────────────────
const Butterfly: React.FC = () => (
  <svg width="50" height="40" viewBox="0 0 62 50" fill="none">
    <g style={{ transformBox: 'fill-box', transformOrigin: 'right center',
                 animation: 'butterflyWing 0.06s linear infinite' }}>
      <path d="M31 25 Q19 9 5 13 Q-1 23 13 31 Z"     fill="#86efac" opacity="0.92" />
      <path d="M31 25 Q19 14 9 15"                    stroke="#15803d" strokeWidth="0.7" fill="none" opacity="0.5" />
      <path d="M31 25 Q19 35 11 43 Q19 49 31 37 Z"   fill="#4ade80" opacity="0.88" />
      <circle cx="13" cy="23" r="2.5"                 fill="rgba(21,128,61,0.35)" />
    </g>
    <g style={{ transformBox: 'fill-box', transformOrigin: 'left center',
                 animation: 'butterflyWing 0.06s linear infinite' }}>
      <path d="M31 25 Q43 9 57 13 Q63 23 49 31 Z"    fill="#86efac" opacity="0.92" />
      <path d="M31 25 Q43 14 53 15"                   stroke="#15803d" strokeWidth="0.7" fill="none" opacity="0.5" />
      <path d="M31 25 Q43 35 51 43 Q43 49 31 37 Z"   fill="#4ade80" opacity="0.88" />
      <circle cx="49" cy="23" r="2.5"                 fill="rgba(21,128,61,0.35)" />
    </g>
    <ellipse cx="31" cy="25" rx="3" ry="14" fill="#1c1917" />
    <circle  cx="31" cy="11" r="3.5"        fill="#1c1917" />
    <path d="M30 8 Q25 3 21 2" stroke="#1c1917" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <circle cx="21" cy="2"  r="1.8" fill="#1c1917" />
    <path d="M32 8 Q37 3 41 2" stroke="#1c1917" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <circle cx="41" cy="2"  r="1.8" fill="#1c1917" />
  </svg>
);

// ── SVG: Ladybug (slightly smaller) ──────────────────────────────
const Ladybug: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
    <ellipse cx="18" cy="22" rx="12" ry="13" fill="#ef4444" />
    <line x1="18" y1="10" x2="18" y2="35" stroke="#1c1917" strokeWidth="1.5" />
    <circle cx="12.5" cy="19" r="3"    fill="#1c1917" />
    <circle cx="23.5" cy="19" r="3"    fill="#1c1917" />
    <circle cx="13"   cy="27" r="2.5"  fill="#1c1917" />
    <circle cx="23"   cy="27" r="2.5"  fill="#1c1917" />
    <circle cx="18"   cy="10" r="7"    fill="#1c1917" />
    <circle cx="15"   cy="9"  r="1.5"  fill="white" />
    <circle cx="21"   cy="9"  r="1.5"  fill="white" />
    <path d="M15 4 Q11 1 9 -1"  stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="9"  cy="-1" r="2" fill="#1c1917" />
    <path d="M21 4 Q25 1 27 -1" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="27" cy="-1" r="2" fill="#1c1917" />
  </svg>
);

// ── Insect definitions ────────────────────────────────────────────
interface InsectDef {
  id: string;
  Component: React.FC;
  triggerAt: number;
  range: number;
  fromLeft: boolean;
  centerVh: number;
  loopCount: number;
  loopAmpPx: number;
  // Fixed artistic rotation in degrees (null = dynamic / 0 for bee)
  fixedRotation?: number;
  loop?: { start: number; end: number; radiusPx: number };
}

const INSECTS: InsectDef[] = [
  {
    id: 'bee', Component: Bee,
    triggerAt: 0.05, range: 0.55,   // slower crossing
    fromLeft: true,  centerVh: 35,
    loopCount: 1.0,  loopAmpPx: 28,
    fixedRotation: 90,               // head facing right (direction of travel)
    loop: { start: 0.30, end: 0.68, radiusPx: 150 },  // wide real loop
  },
  {
    id: 'butterfly', Component: Butterfly,
    triggerAt: 0.40, range: 0.55,   // slower
    fromLeft: false, centerVh: 28,
    loopCount: 1.5,  loopAmpPx: 64,
    fixedRotation: -45,              // 45° tilt, head upper-left (direction of travel)
  },
  {
    id: 'ladybug', Component: Ladybug,
    triggerAt: 0.65, range: 0.30,   // starts earlier, finishes off-screen right
    fromLeft: true,  centerVh: 42,
    loopCount: 1.0,  loopAmpPx: 32,
    fixedRotation: 90,               // head pointing right (direction of travel)
  },
];

// ── Main component ────────────────────────────────────────────────
const GardenScrollDecor: React.FC = () => {
  const progress  = useScrollProgress();
  const [viewportW, setViewportW] = useState(() => window.innerWidth);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (reducedMotion) return null;

  const xTravelVw = 128;

  return (
    <>

      {INSECTS.map(({ id, Component, triggerAt, range, fromLeft,
                      centerVh, loopCount, loopAmpPx, fixedRotation, loop }) => {
        const local = Math.max(0, Math.min(1, (progress - triggerAt) / range));

        // Base horizontal position (fromLeft = LTR, otherwise RTL)
        const xLinear = fromLeft ? -14 + xTravelVw * local : 114 - xTravelVw * local;

        // Gentle sine-wave vertical oscillation
        const yBase = Math.sin(local * Math.PI * 2 * loopCount) * loopAmpPx;

        let xPct    = xLinear;
        let yOffset = yBase;

        // Base rotation — fixed artistic angle (90° bee, -45° butterfly, 90° ladybug)
        let totalRotation = fixedRotation ?? 0;

        if (loop && local >= loop.start && local <= loop.end) {
          const t     = (local - loop.start) / (loop.end - loop.start);
          const angle = t * Math.PI * 2;

          // Superimpose a full circle: x forward then backward then forward (net 0),
          // y upward then downward (net 0) — continuity preserved at both ends.
          const xLoopPx = loop.radiusPx * Math.sin(angle);
          xPct += (xLoopPx / viewportW) * 100 * (fromLeft ? 1 : -1);

          const yLoopPx = loop.radiusPx * (1 - Math.cos(angle));
          yOffset -= yLoopPx; // negative = upward on screen

          // Loop tilt: tangent of the circle added to the base orientation.
          // atan2(-sinθ, cosθ) gives the heading angle as θ goes 0→2π.
          const loopTilt = Math.atan2(-Math.sin(angle), Math.cos(angle)) * (180 / Math.PI);
          totalRotation = (fixedRotation ?? 0) + loopTilt;
        }

        const transform = `rotate(${totalRotation}deg)`;
        const inRange = progress >= triggerAt - 0.02 && progress <= triggerAt + range + 0.02;

        return (
          <div
            key={id}
            aria-hidden="true"
            className="fixed pointer-events-none select-none"
            style={{
              top:        `calc(${centerVh}vh + ${yOffset}px)`,
              left:       `${xPct}%`,
              zIndex:     10,
              opacity:    inRange ? 1 : 0,
              transition: 'opacity 0.5s ease',
              transform,
              transformOrigin: 'center center',
            }}
          >
            <Component />
          </div>
        );
      })}
    </>
  );
};

export default GardenScrollDecor;

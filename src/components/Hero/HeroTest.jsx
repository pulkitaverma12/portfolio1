import React, { useEffect, useId, useMemo, useState } from 'react';
import meImage from '../../assets/photo.jpg';

const ANIMATION_DURATION = 1800;
const AVATAR_SIZE = 300;

// Cubic-bezier solver for (0.22, 1, 0.36, 1) so timing matches the requested premium easing.
function createCubicBezierEasing(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  const solveCurveX = (x) => {
    let t2 = x;

    for (let i = 0; i < 8; i += 1) {
      const x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < 1e-6) {
        return t2;
      }
      const d2 = sampleDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) {
        break;
      }
      t2 -= x2 / d2;
    }

    let t0 = 0;
    let t1 = 1;
    t2 = x;

    while (t0 < t1) {
      const x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < 1e-6) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2;
  };

  return (x) => sampleCurveY(solveCurveX(x));
}

const HeroTest = () => {
  const clipId = useId().replace(/:/g, '-');
  const [progress, setProgress] = useState(0);

  const easeOutPremium = useMemo(() => createCubicBezierEasing(0.22, 1, 0.36, 1), []);

  useEffect(() => {
    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const linear = Math.min((now - start) / ANIMATION_DURATION, 1);
      const eased = easeOutPremium(linear);
      setProgress(eased);

      if (linear < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [easeOutPremium]);

  const angle = progress * 360;
  const imageScale = 0.95 + progress * 0.05;
  const borderOpacity = 0.18 + progress * 0.55;
  const glowOpacity = 0.08 + progress * 0.2;

  const center = AVATAR_SIZE / 2;
  const radius = center;

  // Create an SVG pie-slice path from 12 o'clock sweeping clockwise to current angle.
  const sectorPath = useMemo(() => {
    if (angle <= 0.0001) {
      return '';
    }

    if (angle >= 359.999) {
      return null;
    }

    const theta = (angle * Math.PI) / 180;
    const startX = center;
    const startY = center - radius;
    const endX = center + radius * Math.sin(theta);
    const endY = center - radius * Math.cos(theta);
    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }, [angle, center, radius]);

  const pageStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 40%, #1a1a1a 0%, #090909 55%, #000000 100%)',
    overflow: 'hidden'
  };

  const shellStyle = {
    width: `${AVATAR_SIZE}px`,
    height: `${AVATAR_SIZE}px`,
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden',
    border: `1.5px solid rgba(229, 229, 229, ${borderOpacity.toFixed(3)})`,
    boxShadow: `0 0 20px rgba(229, 229, 229, ${glowOpacity.toFixed(3)}), 0 16px 36px rgba(0, 0, 0, 0.45)`
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    objectPosition: 'center',
    transform: `scale(${imageScale.toFixed(4)})`,
    willChange: 'transform',
    clipPath: `url(#${clipId})`,
    WebkitClipPath: `url(#${clipId})`
  };

  const defsSvgStyle = {
    position: 'absolute',
    width: 0,
    height: 0,
    pointerEvents: 'none'
  };

  return (
    <section style={pageStyle}>
      <div style={shellStyle}>
        {/* SVG clipPath defines the exact angular reveal shape. */}
        <svg viewBox={`0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}`} style={defsSvgStyle} aria-hidden="true">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              {sectorPath === null ? (
                <circle cx={center} cy={center} r={radius} />
              ) : (
                sectorPath && <path d={sectorPath} />
              )}
            </clipPath>
          </defs>
        </svg>
        <img src={meImage} alt="Pulkita Verma" style={imageStyle} />
      </div>
    </section>
  );
};

export default HeroTest;

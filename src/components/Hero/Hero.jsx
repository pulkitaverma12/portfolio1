import React, { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
// import { Canvas } from '@react-three/fiber';
import { OrbitControls, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import meImage from '../../assets/photo.jpg';
import './Hero.css';

const PROFILE_SWEEP_DURATION = 1800;
const PROFILE_SWEEP_SIZE = 360;

// Cubic-bezier solver for a slow-start, fast-finish reveal timing.
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

const Typewriter = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      setTimeout(() => setIsDeleting(true), 1500);
      return;
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, words]);

  useEffect(() => {
    const blinkTimeout = setInterval(() => setBlink((prev) => !prev), 500);
    return () => clearInterval(blinkTimeout);
  }, []);

  return (
    <span className="typewriter">
      {words[index].substring(0, subIndex)}
      <span className={`cursor ${blink ? 'visible' : 'hidden'}`}>|</span>
    </span>
  );
};

const ThreeDElement = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <Icosahedron args={[1.5, 0]}>
            <MeshDistortMaterial
              color="#E5E5E5"
              emissive="#E5E5E5"
          emissiveIntensity={0.2}
          wireframe
          distort={0.4}
          speed={2}
        />
      </Icosahedron>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
};

const Hero = () => {
  const clipId = useId().replace(/:/g, '-');
  const [profileProgress, setProfileProgress] = useState(0);

  const roles = [
    "Full Stack Developer",
    "UI/UX Designer",
    "Problem Solver",
    "Tech Enthusiast"
  ];

  const sweepEase = useMemo(() => createCubicBezierEasing(0.55, 0.06, 0.68, 0.19), []);
  const sweepCenter = PROFILE_SWEEP_SIZE / 2;
  const sweepRadius = sweepCenter;
  const sweepAngle = profileProgress * 360;

  const sweepPath = useMemo(() => {
    if (sweepAngle <= 0.0001) {
      return '';
    }

    if (sweepAngle >= 359.999) {
      return null;
    }

    const theta = (sweepAngle * Math.PI) / 180;
    const startX = sweepCenter;
    const startY = sweepCenter - sweepRadius;
    const endX = sweepCenter + sweepRadius * Math.sin(theta);
    const endY = sweepCenter - sweepRadius * Math.cos(theta);
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    return `M ${sweepCenter} ${sweepCenter} L ${startX} ${startY} A ${sweepRadius} ${sweepRadius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }, [sweepAngle, sweepCenter, sweepRadius]);

  useEffect(() => {
    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const linear = Math.min((now - start) / PROFILE_SWEEP_DURATION, 1);
      setProfileProgress(sweepEase(linear));

      if (linear < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [sweepEase]);

  return (
    <section id="home" className="hero-section">
      <div className="hero-background"></div>
      
      <div className="hero-container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="hero-name glitch" data-text="Pulkita Verma">
            Pulkita Verma
          </h1>
          
          <div className="hero-roles">
            <span className="static-text">I am a </span>
            <span className="dynamic-text"><Typewriter words={roles} /></span>
          </div>
          
          <p className="hero-tagline">
            Building digital experiences that matter.
          </p>
          
          <div className="hero-ctas">
            <a href="#projects" className="cta-button primary hover-target">
              View My Work
            </a>
            <a href="#contact" className="cta-button secondary hover-target">
              Let's Talk
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visuals"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* <div className="canvas-container">
            <ThreeDElement />
          </div> */}
          
          <div className="profile-container hover-target">
            <div className="profile-img-shell">
              {/* SVG clipPath creates a precise clock-style clockwise reveal sector. */}
              <svg
                viewBox={`0 0 ${PROFILE_SWEEP_SIZE} ${PROFILE_SWEEP_SIZE}`}
                className="profile-clip-defs"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                    {sweepPath === null ? (
                      <circle cx={sweepCenter} cy={sweepCenter} r={sweepRadius} />
                    ) : (
                      sweepPath && <path d={sweepPath} />
                    )}
                  </clipPath>
                </defs>
              </svg>

              <img
                src={meImage}
                alt="Pulkita Verma"
                className="profile-img"
                style={{
                  clipPath: `url(#${clipId})`,
                  WebkitClipPath: `url(#${clipId})`
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

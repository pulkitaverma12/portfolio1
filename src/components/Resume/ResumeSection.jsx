import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import resumeFile from '../../assets/resume.pdf';
import './ResumeSection.css';

const SPRING_CONFIG = { stiffness: 260, damping: 26, mass: 0.5 };
const OPACITY_DURATION_BASE = 1;
const OPACITY_DURATION_VARIATION = 0.25;
const OPACITY_DELAY_STEP = 0.03;
const OPACITY_DELAY_CYCLE = 1.7;
const MIN_OPACITY_MULTIPLIER = 0.5;
const MAX_OPACITY_MULTIPLIER = 1.45;
const MIN_OPACITY_FALLBACK = 0.22;
const PROXIMITY_MULTIPLIER = 1.25;
const PROXIMITY_OPACITY_BOOST = 0.75;
const DOT_SIZE = 2;
const DOT_SPACING = 16;
const REPULSION_RADIUS = 84;
const REPULSION_STRENGTH = 18;

const calculateDistance = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

const generateDots = (width, height, spacing) => {
  const dots = [];
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= cols; col += 1) {
      const x = col * spacing;
      const y = row * spacing;

      const dx = x - centerX;
      const dy = y - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const edgeFactor = Math.min(distanceFromCenter / (maxDistance * 0.7), 1);

      if (Math.random() > edgeFactor) {
        continue;
      }

      const pattern = (row + col) % 3;
      const baseOpacities = [0.22, 0.4, 0.62];
      const opacity = baseOpacities[pattern] * edgeFactor;

      dots.push({
        id: `dot-${row}-${col}`,
        x,
        y,
        baseX: x,
        baseY: y,
        opacity
      });
    }
  }

  return dots;
};

const DotParticle = ({
  dot,
  index,
  dotSize,
  mouseX,
  mouseY,
  repulsionRadius,
  repulsionStrength
}) => {
  const posX = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.cos(angle) * force;
    }

    return 0;
  });

  const posY = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.sin(angle) * force;
    }

    return 0;
  });

  const opacityBoost = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const distance = calculateDistance(dot.baseX, dot.baseY, mx, my);
    const maxDistance = repulsionRadius * PROXIMITY_MULTIPLIER;

    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      return proximityFactor * PROXIMITY_OPACITY_BOOST;
    }

    return 0;
  });

  const x = useSpring(posX, SPRING_CONFIG);
  const y = useSpring(posY, SPRING_CONFIG);

  const baseMinOpacity = Math.max(
    dot.opacity * MIN_OPACITY_MULTIPLIER,
    MIN_OPACITY_FALLBACK
  );
  const baseMaxOpacity = Math.min(dot.opacity * MAX_OPACITY_MULTIPLIER, 1);

  const minOpacityWithBoost = useTransform(opacityBoost, (boost) =>
    Math.min(baseMinOpacity + boost, 1)
  );

  const delay = (index * OPACITY_DELAY_STEP) % OPACITY_DELAY_CYCLE;

  return (
    <motion.span
      animate={{
        opacity: [baseMinOpacity, baseMaxOpacity, baseMinOpacity]
      }}
      className="resume-dot"
      initial={{ opacity: baseMinOpacity }}
      style={{
        width: dotSize,
        height: dotSize,
        left: dot.baseX,
        top: dot.baseY,
        x,
        y,
        opacity: useSpring(minOpacityWithBoost, {
          stiffness: 150,
          damping: 25,
          mass: 0.4
        })
      }}
      transition={{
        opacity: {
          duration:
            OPACITY_DURATION_BASE + (index % 4) * OPACITY_DURATION_VARIATION,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.4, 0, 0.2, 1],
          delay,
          times: [0, 0.5, 1]
        }
      }}
    />
  );
};

const ResumeSection = () => {
  const resumeUrl = resumeFile;
  const cardRef = useRef(null);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const mouseY = useMotionValue(Number.POSITIVE_INFINITY);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const updateDots = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setDots(generateDots(rect.width, rect.height, DOT_SPACING));
    };

    updateDots();

    const resizeObserver = new ResizeObserver(updateDots);
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(Number.POSITIVE_INFINITY);
    mouseY.set(Number.POSITIVE_INFINITY);
  };

  return (
    <section id="resume" className="resume-section">
      <div className="resume-container">
        <motion.div
          className="resume-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <h2 className="resume-title">Resume</h2>
          <p className="resume-subtitle">Download or view my resume</p>
        </motion.div>

        <motion.article
          ref={cardRef}
          className="resume-card resume-mouse-card hover-target"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleMouseLeave}
        >
          <div className="resume-dot-layer" aria-hidden>
            {dots.map((dot, index) => (
              <DotParticle
                key={dot.id}
                dot={dot}
                index={index}
                dotSize={DOT_SIZE}
                mouseX={mouseX}
                mouseY={mouseY}
                repulsionRadius={REPULSION_RADIUS}
                repulsionStrength={REPULSION_STRENGTH}
              />
            ))}
          </div>

          <div className="resume-card-glow" aria-hidden />

          <div className="resume-card-inner">
            {/* <div className="resume-kicker-row">
              <span className="resume-kicker">Career Snapshot</span>
              <span className="resume-kicker-sub">PDF Resume</span>
            </div> */}

            <div className="resume-card-content">
              {/* <h3 className="resume-card-heading">Built for Product + Engineering Roles</h3> */}
              <p className="resume-description">
                Get a complete snapshot of my technical skills, projects, and experience.
              </p>
            </div>

            <div className="resume-actions">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resume-btn resume-btn-outline hover-target"
              >
                View Resume
              </a>
              <a
                href={resumeUrl}
                download="resume.pdf"
                className="resume-btn resume-btn-solid hover-target"
              >
                Download Resume
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
};

export default ResumeSection;

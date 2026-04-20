import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const shouldContainImage = project.imageFit === 'contain';
  const imagePosition = project.imagePosition || 'center center';

  const toggleCard = () => {
    setIsFlipped((prev) => !prev);
  };

  const resetCard = () => {
    setIsFlipped(false);
  };

  const handleKeyDown = (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('.view-btn')) {
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard();
    }
  };

  const handleViewProject = (e) => {
    e.stopPropagation();
    onClick(project);
  };

  return (
    <motion.article
      className={`project-card hover-target ${isFlipped ? 'is-flipped' : ''}`}
      onMouseLeave={resetCard}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onClick={toggleCard}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} card. Flip to see details.`}
    >
      <div className="card-flip-inner">
        <div className="card-face card-front">
          <div className={`card-image-wrapper ${shouldContainImage ? 'is-contain' : ''}`}>
            <img
              src={project.image}
              alt={project.title}
              className={`card-image ${shouldContainImage ? 'fit-contain' : ''}`}
              style={{ objectPosition: imagePosition }}
            />
            <div className="card-overlay">
              <span className="flip-hint">Hover or tap to flip</span>
            </div>
          </div>
          <div className="card-info card-info-front">
            <h3 className="card-title">{project.title}</h3>
            <p className="card-desc">{project.description}</p>
          </div>
        </div>

        <div className="card-face card-back">
          <div className="card-back-top">
            <p className="card-back-label">Project Snapshot</p>
            <h3 className="card-title">{project.title}</h3>
            <p className="card-desc">{project.description}</p>
          </div>

          <div className="card-tags">
            {project.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>

          <button type="button" className="view-btn" onClick={handleViewProject}>
            View Project
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;

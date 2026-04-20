import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../Icons';
import './ProjectModal.css';

const ProjectModal = ({ project, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);

  if (!project) return null;

  const useContainGallery = project.galleryFit === 'contain';
  const galleryPosition = project.galleryPosition || 'center center';

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100vh", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn hover-target" onClick={onClose}>
            <X size={28} />
          </button>

          <div className="modal-inner">
            <div className="modal-gallery">
              <motion.img 
                key={activeImg}
                src={project.gallery[activeImg]} 
                alt={`${project.title} screenshot`} 
                className={`main-img ${useContainGallery ? 'fit-contain' : ''}`}
                style={{ objectPosition: galleryPosition }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="thumbnail-strip">
                {project.gallery.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`thumb ${idx}`}
                    className={`thumbnail hover-target ${activeImg === idx ? 'active' : ''} ${useContainGallery ? 'fit-contain' : ''}`}
                    style={{ objectPosition: galleryPosition }}
                    onClick={() => setActiveImg(idx)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-details">
              <h2 className="modal-title">{project.title}</h2>
              <div className="modal-tags">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              <p className="modal-long-desc">{project.longDescription}</p>
              
              <div className="modal-actions">
                <a href={project.demoUrl} target="_blank" rel="noreferrer" className="action-btn primary hover-target">
                  <ExternalLink size={20} /> Live Demo
                </a>
                {/* <a href={project.githubUrl} target="_blank" rel="noreferrer" className="action-btn secondary hover-target">
                  <GithubIcon size={20} /> GitHub
                </a> */}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectModal;

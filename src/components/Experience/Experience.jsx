import React from 'react';
import { motion } from 'framer-motion';
import './Experience.css';

const experiences = [
  {
    id: 1,
    company: "COE Team, College Government Projects Cell",
    role: "COE Member - Full Stack Development",
    duration: "Mar 2024 – Present",
    achievements: [
      "Built Medi Guru (Virtual Medical Training Platform) using React, PHP, and MySQL for managing virtual training programs for Government doctors under CMHO Raipur.",
      "Developed Smriti Pustakalaya, a digital library donation platform for Government of Chhattisgarh to enable seamless donation and access of e-books and study materials.",
      "Built Chhanv (Health Camp and Welfare Scheme Portal) using React, MySQL, and PHP to manage camps, doctor assignments, and welfare schemes.",
      "Implemented role-based access, real-time analytics, health tracking modules, and scheme verification workflows across the platforms."
    ]
  },
  {
    id: 2,
    company: "Skyvo Technologies Pvt Ltd",
    role: "Web Development Trainee",
    duration: "Jul 2025 – Aug 2025",
    achievements: [
      "Designed and developed a café management website with Home, Menu, Cart, and Payment sections",
      "Integrated frontend with backend APIs for dynamic functionality and smooth user interaction",
      "Built responsive UI using HTML, CSS, and Bootstrap with focus on UX"
    ]
  },
  {
    id: 3,
    company: "Cognifyz Technologies",
    role: "Software Development Intern",
    duration: "Mar 2025 – Apr 2025",
    achievements: [
      "Contributed to application design, development, testing, and deployment",
      "Collaborated with cross-functional teams to analyze requirements and improve workflows",
      "Developed efficient and user-centric software solutions"
    ]
  }
];

const ExperienceCard = ({ exp, index }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`timeline-item ${isEven ? 'left' : 'right'}`}>
      <motion.div 
        className="timeline-content hover-target"
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="timeline-date">{exp.duration}</div>
        <h3 className="timeline-role">{exp.role}</h3>
        <h4 className="timeline-company">{exp.company}</h4>
        <ul className="timeline-achievements">
          {exp.achievements.map((ach, i) => (
            <li key={i}>{ach}</li>
          ))}
        </ul>
      </motion.div>
      <div className="timeline-node"></div>
    </div>
  );
};

const Experience = () => {
  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <div className="section-header text-center">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Experience
          </motion.h2>
        </div>

        <div className="timeline">
          {experiences.map((exp, index) => (
            <ExperienceCard key={exp.id} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

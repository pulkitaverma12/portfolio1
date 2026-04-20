import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import './Projects.css';

const projects = [
  {
    id: 1,
    title: "Chhanv Health Camp Admin Panel",
    description: "Role-based admin and doctor portal for managing government health camps, patients, and scheme workflows.",
    longDescription: "Built a full-featured health operations platform with separate Admin and Doctor portals, secure login flow, camp scheduling, patient records, and analytics dashboards. The app includes reports with chart visualizations, activity tracking, and responsive Hindi-first screens for field and office users.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite", "React Router", "Recharts"],
    image: "/projects/chhanv_logo.svg",
    imageFit: "contain",
    galleryFit: "contain",
    gallery: [
      "/projects/chhanv_logo.svg"
    ],
    demoUrl: "https://chanv.ssipmt.in/"
  },
  {
    id: 2,
    title: "Coffee Break Food Ordering App",
    description: "Angular-based food ordering app with vegetarian menu filters, cart, wallet top-up, and multi-method checkout flow.",
    longDescription: "Built a complete food ordering frontend in Angular with category-wise browsing, search, cart management, quantity controls, and payment processing. The app includes wallet recharge (deposit), card/UPI/net-banking payment options, order creation and verification flow, and local persistence for cart and transaction history.",
    tags: ["Angular", "TypeScript", "RxJS", "Angular Router", "REST API", "CSS"],
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlfGVufDB8fDB8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlfGVufDB8fDB8fHww",
    ],
    demoUrl: "#",
  },
  {
    id: 3,
    title: "Gulab Jewellery Store Website",
    description: "Responsive Bootstrap jewellery storefront with category navigation, product carousel, and premium visual sections.",
    longDescription: "Built a complete jewellery landing page using Bootstrap 5, Bootstrap Icons, and custom CSS. The project features a dual-navbar layout, hero banner CTA, product showcase carousel, themed card interactions, parallax storytelling sections, and a structured multi-column footer for customer support and brand trust.",
    tags: ["HTML5", "Bootstrap 5", "CSS3", "Bootstrap Icons", "JavaScript"],
    image: "/projects/gulab/j20.jpg",
    gallery: [
      "/projects/gulab/banner1.jpg",
      "/projects/gulab/j13.jpg",
      "/projects/gulab/j20.jpg",
      "/projects/gulab/j6.jpg"
    ],
    demoUrl: "#",
  },
  {
    id: 4,
    title: "Pustakalay Library Management System",
    description: "Government-themed library management web app for books, donors, librarians, and book transfer workflows.",
    longDescription: "Built a responsive library operations dashboard using React + TypeScript + Vite with login flow, role-based dashboard sections, and module-wise management screens. The app includes book inventory handling, donor records, librarian records, transfer tracking, stat cards, and centralized theme styling with a government-compliant visual system.",
    tags: ["React", "TypeScript", "Vite", "React Router", "CSS", "Lucide"],
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D",
    gallery: [
      "/projects/pustakalay/Pustakalaya.png",
      // "/projects/pustakalay/Pustakalaya logo.png",
      // "/projects/pustakalay/Pustakalaya 1.png",
      // "/projects/pustakalay/Pustakalaya 3.png",
      // "/projects/pustakalay/Pustakalaya 5.png"
    ],
    demoUrl: "https://smritipustakalaya.ssipmt.in/",
  },
  {
    id: 5,
    title: "Medi Guru Virtual Medical Training Portal",
    description: "Full-stack training management platform for government medical officers with session scheduling, uploads, analytics, and role-based access.",
    longDescription: "Built a full-stack web platform for virtual physician training using React + TypeScript on the frontend and PHP + MySQL APIs on the backend. The system supports role-based authentication, meeting creation, attendance and test data uploads, statistics dashboards, and export/report workflows for CMHO-level monitoring.",
    tags: ["React", "TypeScript", "Vite", "PHP", "MySQL", "JWT", "XLSX"],
    image: "/projects/mediguru/medigurulogo.png",
    imageFit: "contain",
    galleryFit: "contain",
    gallery: [
      "/projects/mediguru/medigurulogo.png",
      // "/projects/mediguru/medigurulogo.svg",
      // "/projects/mediguru/medigurulogo.png",
      // "/projects/mediguru/medigurulogo.svg"
    ],
    demoUrl: "https://mediguru.ssipmt.in/",
  },
  {
    id: 6,
    title: "Bluetooth Controlled Obstacle Avoiding Robot",
    description: "Bluetooth-controlled Arduino robot with real-time obstacle detection and automatic collision prevention.",
    longDescription: "Developed a Bluetooth-controlled robotic vehicle using Arduino and the HC-05 module for wireless movement control from a mobile app. Integrated an ultrasonic sensor for continuous obstacle detection so the robot can stop immediately before collision, even when manual movement commands are active. Implemented real-time serial command handling with Serial.read(), switch-case based movement flow for commands like F and B, and dedicated motor control functions forward(), back(), and Stop() using an L293D/AFMotor-based setup.",
    tags: ["Arduino", "HC-05 Bluetooth", "Embedded C", "L293D", "AFMotor", "Ultrasonic Sensor"],
    image: "/projects/bluetooth-controller/robot-1.jpeg",
    imageFit: "contain",
    galleryFit: "contain",
    imagePosition: "center center",
    galleryPosition: "center center",
    gallery: [
      "/projects/bluetooth-controller/robot-1.jpeg",
      "/projects/bluetooth-controller/robot-2.jpeg",
      "/projects/bluetooth-controller/robot-3.jpeg"
    ],
    demoUrl: "#",
  },
  // {
  //   id: 7,
  //   title: "Blog CMS",
  //   description: "Headless content management system optimized for SEO and speed.",
  //   longDescription: "A custom headless CMS built for speed and SEO. Features MDX support, scheduled publishing, and a custom PostgreSQL backend to handle high traffic read operations efficiently.",
  //   tags: ["Next.js", "PostgreSQL", "Prisma"],
  //   image: "https://picsum.photos/seed/proj6/800/600",
  //   gallery: [
  //     "https://picsum.photos/seed/proj6/800/600",
  //     "https://picsum.photos/seed/proj6a/800/600",
  //     "https://picsum.photos/seed/proj6b/800/600",
  //     "https://picsum.photos/seed/proj6c/800/600"
  //   ],
  //   demoUrl: "#",
  //   githubUrl: "#"
  // }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  React.useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedProject]);

  return (
    <section id="projects" className="projects-section">
      <div className="projects-container">
        <div className="section-header">
          <motion.h2 
            className="section-title projects-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            My Work
            <span className="title-bg">PROJECTS</span>
          </motion.h2>
        </div>

        <div className="projects-grid">
          {projects.map((project, idx) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={(p) => setSelectedProject(p)} 
            />
          ))}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
};

export default Projects;

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  mouseX: number;
  mouseY: number;
  isExpanded: boolean;
}

export const GeometricBackground: React.FC<Props> = ({ mouseX, mouseY, isExpanded }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const chaosGroupRef = useRef<SVGGElement>(null);
  const structureGroupRef = useRef<SVGGElement>(null);

  // Parallax & Chaos Effect
  useEffect(() => {
    if (!containerRef.current || !chaosGroupRef.current) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotateX = (mouseX - centerX) * 0.01;
    const rotateY = (mouseY - centerY) * 0.01;

    // Move the entire structure slightly for depth
    gsap.to(structureGroupRef.current, {
      x: -rotateX * 2,
      y: -rotateY * 2,
      rotation: rotateX * 0.5,
      duration: 2,
      ease: 'power2.out',
    });

    // Chaos particles float independently
    gsap.to(chaosGroupRef.current?.children || [], {
      x: (i) => (i % 2 === 0 ? rotateX * 4 : -rotateX * 4),
      y: (i) => (i % 2 === 0 ? rotateY * 4 : -rotateY * 4),
      duration: 3,
      ease: 'sine.inOut',
      stagger: 0.1
    });

  }, [mouseX, mouseY]);

  // Expand/Contract State
  useEffect(() => {
    const particles = chaosGroupRef.current?.children;
    
    if (isExpanded) {
      // Structure expands and fades
      gsap.to(structureGroupRef.current, {
        scale: 1.5,
        opacity: 0.2,
        duration: 1.5,
        ease: 'expo.inOut',
      });
      
      // Chaos particles align into a ring (Structure from Chaos)
      if (particles) {
        gsap.to(particles, {
          x: (i, target) => {
            const angle = (i / particles.length) * Math.PI * 2;
            return Math.cos(angle) * 400 + 500 - parseFloat(target.getAttribute('cx') || '0'); 
          },
          y: (i, target) => {
            const angle = (i / particles.length) * Math.PI * 2;
            return Math.sin(angle) * 400 + 500 - parseFloat(target.getAttribute('cy') || '0');
          },
          opacity: 0.6,
          fill: '#d4af37',
          duration: 1.2,
          ease: 'power3.inOut'
        });
      }

    } else {
      // Return to normal
      gsap.to(structureGroupRef.current, {
        scale: 1,
        opacity: 0.5,
        duration: 1.5,
        ease: 'expo.inOut',
      });

      // Chaos particles return to random
      if (particles) {
        gsap.to(particles, {
          x: 0,
          y: 0,
          opacity: 0.3,
          fill: '#1e3a8a',
          duration: 1.5,
          ease: 'power3.inOut'
        });
      }
    }
  }, [isExpanded]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-navy-950 perspective-[1000px]">
      <svg
        ref={containerRef}
        className="w-full h-full transition-colors duration-700"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="deepOcean" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#112240" stopOpacity="1" />
            <stop offset="60%" stopColor="#0a192f" stopOpacity="1" />
            <stop offset="100%" stopColor="#020c1b" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#deepOcean)" />

        {/* Chaos Particles Layer */}
        <g ref={chaosGroupRef}>
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={`chaos-${i}`}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r={Math.random() * 3 + 1}
              fill="#1e3a8a"
              opacity="0.3"
            />
          ))}
        </g>

        {/* Structured Sacred Geometry Layer */}
        <g ref={structureGroupRef} transform="translate(500, 500)" opacity="0.5">
          {/* Large Rings */}
          <circle r="300" fill="none" stroke="#1e3a8a" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle r="450" fill="none" stroke="#1e3a8a" strokeWidth="0.2" />
          
          {/* Nautical Lines */}
          <line x1="-500" y1="0" x2="500" y2="0" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="-500" x2="0" y2="500" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.3" />
          
          {/* Mandala / Compass Star */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 30})`}>
               <path d="M0 -100 Q 50 -200 0 -300 Q -50 -200 0 -100" fill="none" stroke="#64ffda" strokeWidth="0.5" opacity="0.2" />
               <line x1="0" y1="-100" x2="0" y2="-350" stroke="#1e3a8a" strokeWidth="1" opacity="0.1" />
            </g>
          ))}
          
          {/* Inner Geometric Core */}
          <rect x="-100" y="-100" width="200" height="200" transform="rotate(45)" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.4" />
          <circle r="70" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
        </g>
      </svg>
      
      {/* Noise Texture for that gritty paper/film feel */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay"></div>
      
      {/* Deep Vignette */}
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none"></div>
    </div>
  );
};
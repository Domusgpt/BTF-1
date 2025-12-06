import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isExpanded: boolean;
}

export const GeometricBackground: React.FC<Props> = ({ isExpanded }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const chaosGroupRef = useRef<SVGGElement>(null);
  const structureGroupRef = useRef<SVGGElement>(null);
  
  // Internal refs for animation state to avoid React re-renders
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    // 1. Internal Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 2. Initialize Particles
    if (chaosGroupRef.current) {
      // Clear existing
      while (chaosGroupRef.current.firstChild) {
        chaosGroupRef.current.removeChild(chaosGroupRef.current.firstChild);
      }
      particlesRef.current = [];

      // Create new particles
      for (let i = 0; i < 60; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", (Math.random() * 2 + 1).toString());
        circle.setAttribute("fill", "#64ffda"); // Cyan/Gold mix for visibility
        circle.setAttribute("opacity", (Math.random() * 0.4 + 0.1).toString());
        
        chaosGroupRef.current.appendChild(circle);
        
        particlesRef.current.push({
          el: circle,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          baseX: x,
          baseY: y
        });
      }
    }

    // 3. Animation Loop (GSAP Ticker)
    const tick = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Calculate distance of mouse from center (normalized 0-1)
      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - centerY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = Math.sqrt(centerX*centerX + centerY*centerY);
      const proximity = 1 - Math.min(dist / maxDist, 1); // 1 = center, 0 = edge

      // Rotate structure based on mouse
      if (structureGroupRef.current) {
        gsap.set(structureGroupRef.current, {
          rotation: dx * 0.02,
          x: -dx * 0.05,
          y: -dy * 0.05
        });
      }

      // Update Particles
      particlesRef.current.forEach(p => {
        // Higher proximity to center = higher chaos/speed
        const speed = 0.2 + (proximity * 2.5); 
        const jitter = proximity * 2;

        p.x += p.vx * speed + (Math.random() - 0.5) * jitter;
        p.y += p.vy * speed + (Math.random() - 0.5) * jitter;

        // Wrap around logic (0-1000 viewbox)
        if (p.x < 0) p.x = 1000;
        if (p.x > 1000) p.x = 0;
        if (p.y < 0) p.y = 1000;
        if (p.y > 1000) p.y = 0;

        p.el.setAttribute("cx", p.x.toString());
        p.el.setAttribute("cy", p.y.toString());
      });
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  // Expand/Contract State (React Controlled)
  useEffect(() => {
    if (isExpanded) {
      // Structure expands
      gsap.to(structureGroupRef.current, {
        scale: 1.8,
        opacity: 0.1,
        duration: 1.2,
        ease: 'expo.inOut',
      });
      
      // Particles align
      if (particlesRef.current.length) {
        // We pause the ticker update of positions for a moment to let GSAP take over animation
        // creating a "lock in" effect
        particlesRef.current.forEach((p, i) => {
            const angle = (i / particlesRef.current.length) * Math.PI * 2;
            const targetX = 500 + Math.cos(angle) * 350;
            const targetY = 500 + Math.sin(angle) * 350;
            
            gsap.to(p.el, {
                attr: { cx: targetX, cy: targetY },
                fill: '#d4af37',
                opacity: 0.8,
                duration: 1,
                ease: 'power3.inOut',
                onUpdate: () => {
                    // Update internal state so ticker doesn't snap back immediately
                    p.x = targetX;
                    p.y = targetY;
                }
            });
        });
      }

    } else {
      // Return to normal
      gsap.to(structureGroupRef.current, {
        scale: 1,
        opacity: 0.6,
        duration: 1.5,
        ease: 'expo.inOut',
      });
      
      particlesRef.current.forEach(p => {
          gsap.to(p.el, {
              fill: '#64ffda',
              opacity: Math.random() * 0.4 + 0.1,
              duration: 1,
          });
      });
    }
  }, [isExpanded]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-navy-950 perspective-[1000px]">
      <svg
        ref={containerRef}
        className="w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="deepOcean" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#112240" stopOpacity="1" />
            <stop offset="100%" stopColor="#020c1b" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#deepOcean)" />

        {/* Chaos Particles Layer */}
        <g ref={chaosGroupRef}></g>

        {/* Structured Sacred Geometry Layer */}
        <g ref={structureGroupRef} transform="translate(500, 500)" opacity="0.6">
          {/* Concentric Circles */}
          <circle r="250" fill="none" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="10 5" opacity="0.3" />
          <circle r="350" fill="none" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.2" />
          <circle r="480" fill="none" stroke="#1e3a8a" strokeWidth="2" opacity="0.1" />
          
          {/* Crosshairs */}
          <line x1="-1000" y1="0" x2="1000" y2="0" stroke="#d4af37" strokeWidth="0.5" opacity="0.2" />
          <line x1="0" y1="-1000" x2="0" y2="1000" stroke="#d4af37" strokeWidth="0.5" opacity="0.2" />
          
          {/* Compass Rose Geometry */}
          <g transform="rotate(45)">
              <rect x="-150" y="-150" width="300" height="300" fill="none" stroke="#64ffda" strokeWidth="0.5" opacity="0.1" />
          </g>
          
          {/* Mandala Petals */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path 
                key={i} 
                d="M0 0 L50 -100 L0 -200 L-50 -100 Z" 
                fill="none" 
                stroke="#1e3a8a" 
                strokeWidth="1" 
                opacity="0.1" 
                transform={`rotate(${i * 45}) translate(0, -100)`} 
            />
          ))}
        </g>
      </svg>
      
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none"></div>
    </div>
  );
};
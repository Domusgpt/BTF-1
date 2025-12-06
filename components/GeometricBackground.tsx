
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  isExpanded: boolean;
}

export const GeometricBackground: React.FC<Props> = ({ isExpanded }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const chaosGroupRef = useRef<SVGGElement>(null);
  const structureGroupRef = useRef<SVGGElement>(null);
  
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    if (chaosGroupRef.current) {
      while (chaosGroupRef.current.firstChild) {
        chaosGroupRef.current.removeChild(chaosGroupRef.current.firstChild);
      }
      particlesRef.current = [];

      for (let i = 0; i < 50; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", (Math.random() * 2 + 0.5).toString());
        circle.setAttribute("fill", "#64ffda");
        circle.setAttribute("opacity", (Math.random() * 0.3 + 0.1).toString());
        
        chaosGroupRef.current.appendChild(circle);
        
        particlesRef.current.push({
          el: circle,
          x,
          y,
          // Slower base velocity
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          baseX: x,
          baseY: y
        });
      }
    }

    const tick = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - centerY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = Math.sqrt(centerX*centerX + centerY*centerY);
      const proximity = 1 - Math.min(dist / maxDist, 1);

      if (structureGroupRef.current) {
        // Slower rotation
        gsap.set(structureGroupRef.current, {
          rotation: dx * 0.01, 
          x: -dx * 0.03,
          y: -dy * 0.03
        });
      }

      particlesRef.current.forEach(p => {
        // Reduced speed multipliers
        const speed = 0.2 + (proximity * 1.5); 
        const jitter = proximity * 1.0;

        p.x += p.vx * speed + (Math.random() - 0.5) * jitter;
        p.y += p.vy * speed + (Math.random() - 0.5) * jitter;

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

  useEffect(() => {
    if (isExpanded) {
      gsap.to(structureGroupRef.current, {
        scale: 1.5,
        opacity: 0.1,
        duration: 1.5, // Slower
        ease: 'expo.inOut',
      });
      
      if (particlesRef.current.length) {
        particlesRef.current.forEach((p, i) => {
            const angle = (i / particlesRef.current.length) * Math.PI * 2;
            const targetX = 500 + Math.cos(angle) * 350;
            const targetY = 500 + Math.sin(angle) * 350;
            
            gsap.to(p.el, {
                attr: { cx: targetX, cy: targetY },
                fill: '#d4af37',
                opacity: 0.6,
                duration: 1.2,
                ease: 'power3.inOut',
                onUpdate: () => {
                    p.x = targetX;
                    p.y = targetY;
                }
            });
        });
      }

    } else {
      gsap.to(structureGroupRef.current, {
        scale: 1,
        opacity: 0.6,
        duration: 1.8, // Slower
        ease: 'expo.inOut',
      });
      
      particlesRef.current.forEach(p => {
          gsap.to(p.el, {
              fill: '#64ffda',
              opacity: Math.random() * 0.3 + 0.1,
              duration: 1.5,
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
          <radialGradient id="deepOcean" cx="50%" cy="50%" r="90%">
            <stop offset="0%" stopColor="#112240" stopOpacity="1" />
            <stop offset="100%" stopColor="#020c1b" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#deepOcean)" />

        <g ref={chaosGroupRef}></g>

        <g ref={structureGroupRef} transform="translate(500, 500)" opacity="0.6">
          <circle r="250" fill="none" stroke="#1e3a8a" strokeWidth="0.5" strokeDasharray="20 10" opacity="0.3" />
          <circle r="350" fill="none" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.2" />
          <circle r="480" fill="none" stroke="#1e3a8a" strokeWidth="1" opacity="0.1" />
          
          <line x1="-1000" y1="0" x2="1000" y2="0" stroke="#d4af37" strokeWidth="0.5" opacity="0.1" />
          <line x1="0" y1="-1000" x2="0" y2="1000" stroke="#d4af37" strokeWidth="0.5" opacity="0.1" />
          
          <g transform="rotate(45)">
              <rect x="-200" y="-200" width="400" height="400" fill="none" stroke="#64ffda" strokeWidth="0.5" opacity="0.05" />
          </g>
        </g>
      </svg>
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none"></div>
    </div>
  );
};

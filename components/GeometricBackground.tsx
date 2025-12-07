
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { GeometryMode, ThemeColors } from '../types';

interface Props {
  isExpanded: boolean;
  mode: GeometryMode;
  colors: ThemeColors;
}

const PARTICLE_COUNT = 80;
const CENTER_X = 500;
const CENTER_Y = 500;

export const GeometricBackground: React.FC<Props> = ({ isExpanded, mode, colors }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const particleGroupRef = useRef<SVGGElement>(null);
  const ringGroupRef = useRef<SVGGElement>(null);
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<any[]>([]);

  // Initialize Particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to SVG coordinate space roughly
      const svgRect = containerRef.current?.getBoundingClientRect();
      if (svgRect) {
        mouseRef.current = { 
          x: (e.clientX / svgRect.width) * 1000, 
          y: (e.clientY / svgRect.height) * 1000 
        };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    if (particleGroupRef.current) {
      // Clear existing
      while (particleGroupRef.current.firstChild) {
        particleGroupRef.current.removeChild(particleGroupRef.current.firstChild);
      }
      particlesRef.current = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        
        // Initial random position
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        
        circle.setAttribute("r", (Math.random() * 2 + 1).toString());
        circle.setAttribute("fill", colors.accent);
        circle.setAttribute("opacity", (Math.random() * 0.5 + 0.1).toString());
        
        particleGroupRef.current.appendChild(circle);
        
        particlesRef.current.push({
          el: circle,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          // Store geometric targets
          targetX: x,
          targetY: y,
          // Chaos anchors
          chaosX: Math.random() * 1000,
          chaosY: Math.random() * 1000,
        });
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Run once on mount

  // Update Color Theme
  useEffect(() => {
    if (!particlesRef.current.length) return;
    
    particlesRef.current.forEach((p, i) => {
      gsap.to(p.el, {
        fill: colors.accent,
        duration: 2,
        ease: 'power2.inOut',
        delay: i * 0.005
      });
    });

    if (ringGroupRef.current) {
        gsap.to(ringGroupRef.current.querySelectorAll('circle, line, rect'), {
            stroke: colors.accent,
            duration: 2,
            ease: 'power2.inOut'
        });
    }
  }, [colors]);

  // Main Animation Loop
  useEffect(() => {
    const tick = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p, i) => {
        // Calculate Target Position based on Mode
        if (mode === 'chaos') {
            // Browninan motion
            p.targetX = p.chaosX + Math.sin(Date.now() * 0.001 + i) * 50;
            p.targetY = p.chaosY + Math.cos(Date.now() * 0.001 + i) * 50;
        } else if (mode === 'circle') {
            // Tuna Run - Concentric circle
            const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Date.now() * 0.0005);
            const radius = 300 + Math.sin(i + Date.now() * 0.002) * 20;
            p.targetX = CENTER_X + Math.cos(angle) * radius;
            p.targetY = CENTER_Y + Math.sin(angle) * radius;
        } else if (mode === 'grid') {
            // Catalog - Inventory Matrix
            const cols = 10;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const spacing = 80;
            const offsetX = (1000 - (cols * spacing)) / 2;
            const offsetY = 200;
            p.targetX = offsetX + col * spacing;
            p.targetY = offsetY + row * spacing;
        } else if (mode === 'lotus') {
            // Ethos - Sacred Geometry Lotus
            const petalCount = 8;
            const angle = (i / PARTICLE_COUNT) * Math.PI * 2 * 3; // 3 loops
            const r = 300 * Math.cos(petalCount/2 * angle); // Rose curve
            p.targetX = CENTER_X + Math.cos(angle) * r + Math.cos(angle)*100;
            p.targetY = CENTER_Y + Math.sin(angle) * r + Math.sin(angle)*100;
        }

        // Apply Mouse Parallax to Target
        const parallaxX = (mx - 500) * 0.05 * (i % 5 + 1);
        const parallaxY = (my - 500) * 0.05 * (i % 5 + 1);

        // Lerp current position to target
        const ease = isExpanded ? 0.02 : 0.05; // Slower when expanded
        
        p.x += (p.targetX + parallaxX - p.x) * ease;
        p.y += (p.targetY + parallaxY - p.y) * ease;

        // Render
        p.el.setAttribute("cx", p.x.toString());
        p.el.setAttribute("cy", p.y.toString());
      });

      // Rotate Rings based on mouse and time
      if (ringGroupRef.current) {
         const rings = ringGroupRef.current.children;
         for(let i=0; i<rings.length; i++) {
            const speed = 0.02 * (i % 2 === 0 ? 1 : -1);
            const currentRot = gsap.getProperty(rings[i], "rotation") as number || 0;
            gsap.set(rings[i], { rotation: currentRot + speed + (mx - 500) * 0.0001 });
         }
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [mode, isExpanded]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-navy-950 perspective-[1000px]">
      <svg
        ref={containerRef}
        className="w-full h-full transition-transform duration-[2s] ease-in-out"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: isExpanded ? 'scale(1.1)' : 'scale(1)' }}
      >
        <defs>
          <radialGradient id="deepOcean" cx="50%" cy="50%" r="90%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#020c1b" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#deepOcean)" className="transition-all duration-1000" />

        {/* Structure Rings Layer */}
        <g ref={ringGroupRef} transform="translate(500, 500)" opacity={isExpanded ? 0.1 : 0.3} className="transition-opacity duration-1000">
          <g>
             <circle r="400" fill="none" stroke={colors.accent} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
             <path d="M-400 0 L400 0 M0 -400 L0 400" stroke={colors.accent} strokeWidth="0.5" opacity="0.2" />
          </g>
          <g>
             <rect x="-300" y="-300" width="600" height="600" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.2" />
             <circle r="300" fill="none" stroke={colors.accent} strokeWidth="1" strokeDasharray="20 20" opacity="0.4" />
          </g>
          <g>
             <circle r="150" fill="none" stroke={colors.accent} strokeWidth="2" opacity="0.1" />
             <path d="M0 -150 L130 75 L-130 75 Z" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.2" />
             <path d="M0 150 L130 -75 L-130 -75 Z" fill="none" stroke={colors.accent} strokeWidth="0.5" opacity="0.2" />
          </g>
        </g>

        {/* Chaos/Order Particles */}
        <g ref={particleGroupRef}></g>

      </svg>
      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none mix-blend-multiply"></div>
    </div>
  );
};

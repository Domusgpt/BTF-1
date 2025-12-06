import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { StoryCard, Rect } from '../types';
import { X, MapPin, Anchor, CircleDashed } from 'lucide-react';

interface Props {
  card: StoryCard;
  initialRect: Rect;
  onClose: () => void;
}

export const ContentOverlay: React.FC<Props> = ({ card, initialRect, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const contentElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Initial State: Set container to match the clicked card's position
    gsap.set(containerRef.current, {
      top: initialRect.top,
      left: initialRect.left,
      width: initialRect.width,
      height: initialRect.height,
      borderRadius: '2px',
      position: 'fixed',
      zIndex: 50,
    });

    // 2. Expand Animation (The "Domus" Effect)
    tl.to(containerRef.current, {
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      duration: 0.8,
      ease: 'power4.inOut',
    })
    // 3. Staggered Content Reveal
    .fromTo(contentElementsRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.1 } // Make container visible
    )
    .fromTo(".overlay-animate-up", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
      "-=0.4"
    );

    // Image adjustment
    gsap.to(imgContainerRef.current, {
      scale: 1,
      filter: 'grayscale(0%)',
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.2
    });

  }, [initialRect]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    
    // Fade out text first
    tl.to(".overlay-animate-up", {
      y: -20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05
    })
    // Shrink back to original position (approximate visual reverse) or just fade out cleanly
    .to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power3.inOut'
    });
  };

  return (
    <div 
      ref={containerRef}
      className="bg-navy-950 overflow-hidden shadow-2xl flex flex-col md:flex-row"
    >
      <button 
        onClick={handleClose}
        className="absolute top-8 right-8 z-[60] text-gold-400 hover:text-white transition-colors mix-blend-difference group"
      >
        <div className="relative">
          <CircleDashed size={48} className="animate-[spin_10s_linear_infinite] opacity-50 group-hover:opacity-100" />
          <X size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </button>

      {/* Image Half */}
      <div ref={imgContainerRef} className="w-full md:w-1/2 h-[40vh] md:h-full relative overflow-hidden grayscale-[50%]">
        <div className="absolute inset-0 bg-navy-900/30 z-10 mix-blend-multiply" />
        <img 
          src={card.image} 
          alt={card.title} 
          className="w-full h-full object-cover scale-110"
        />
        
        {/* Decorative Grid on Image */}
        <div className="absolute inset-0 z-20 p-12 pointer-events-none border-[0.5px] border-white/10 m-4">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10"></div>
          <div className="absolute top-0 left-1/2 h-full w-[1px] bg-white/10"></div>
        </div>

        <div className="absolute bottom-12 left-12 z-20 text-gold-400 font-sans text-xs tracking-widest flex items-center gap-2 overlay-animate-up">
          <MapPin size={14} />
          {card.coordinates}
        </div>
      </div>

      {/* Content Half */}
      <div ref={textContainerRef} className="w-full md:w-1/2 h-[60vh] md:h-full relative bg-navy-950 flex flex-col justify-center p-8 md:p-24">
        
        {/* Background Graphic in Text Area */}
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
           <svg width="400" height="400" viewBox="0 0 100 100" className="animate-[spin_60s_linear_infinite]">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" stroke="currentColor" fill="none" className="text-gold-400" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" className="text-gold-400" />
           </svg>
        </div>

        <div ref={contentElementsRef}>
          <div className="flex items-center gap-3 text-gold-500 mb-8 overlay-animate-up">
            <Anchor size={20} />
            <span className="text-xs font-sans tracking-[0.3em] uppercase border-b border-gold-500/30 pb-1">
              {card.type}
            </span>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-serif text-parchment mb-6 leading-[0.9] overlay-animate-up">
            {card.title.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h2>
          
          <h3 className="text-xl md:text-2xl font-serif text-gold-400 mb-12 italic overlay-animate-up flex items-center gap-4">
            <span className="w-12 h-[1px] bg-gold-500/50"></span>
            {card.subtitle}
          </h3>
          
          <div className="overlay-animate-up max-w-lg">
             <p className="text-parchment/80 font-sans text-lg leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:text-gold-500 first-letter:mr-3 first-letter:float-left">
              {card.fullContent}
            </p>
          </div>

          <div className="mt-16 overlay-animate-up">
            <button className="group relative px-8 py-4 bg-transparent overflow-hidden border border-gold-500/30 text-gold-400 font-sans text-xs tracking-[0.2em] transition-all hover:border-gold-500">
              <span className="relative z-10 group-hover:text-navy-950 transition-colors duration-300">INITIATE ORDER</span>
              <div className="absolute inset-0 bg-gold-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
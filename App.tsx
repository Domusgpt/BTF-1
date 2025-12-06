
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GeometricBackground } from './components/GeometricBackground';
import { IntroSequence } from './components/IntroSequence';
import { ContentOverlay } from './components/ContentOverlay';
import { STORY_CARDS } from './constants';
import { StoryCard, Rect } from './types';
import { ArrowRight, Compass, ShipWheel, Anchor } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<{ card: StoryCard; rect: Rect } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroImageRef = useRef<HTMLImageElement>(null);

  // Sync geometry state with active card
  useEffect(() => {
    setIsExpanded(!!activeCard);
  }, [activeCard]);

  // "Chaos to Structure" & Scroll Animations
  useEffect(() => {
    if (loading) return;

    // 0. Hero Parallax
    if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
            yPercent: 30, // Moves down slower than scroll
            ease: "none",
            scrollTrigger: {
                trigger: "header",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // 1. Initial Chaos Animation (Intro)
    // We animate the *wrapper* refs
    gsap.fromTo(cardsRef.current, 
      { 
        x: () => Math.random() * 400 - 200,
        y: () => Math.random() * 400 + 100,
        rotation: () => Math.random() * 15 - 7.5,
        opacity: 0,
        scale: 0.8
      },
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1, // Reset to 1, ScrollTrigger will take over
        duration: 1.8,
        stagger: 0.15,
        ease: 'expo.out',
        clearProps: 'all', // Important: clear inline styles so ScrollTrigger can control cleanly
        onComplete: () => {
            initScrollAnimations();
        }
      }
    );

    const initScrollAnimations = () => {
        cardsRef.current.forEach((card) => {
            if(!card) return;

            // 2. Z-Axis Scroll Depth (Center Focus)
            // As cards move through the viewport, they scale up towards the center and down at edges
            
            // Enter Phase (Bottom to Center)
            gsap.fromTo(card, 
                { scale: 0.9, opacity: 0.6, y: 100 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom",
                        end: "center center",
                        scrub: 1
                    }
                }
            );

            // Exit Phase (Center to Top)
            gsap.to(card, {
                scale: 0.9,
                opacity: 0.6,
                y: -100, // Parallax continues upward
                ease: "power2.in",
                scrollTrigger: {
                    trigger: card,
                    start: "center center",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });
    };

  }, [loading]);

  const handleCardClick = (card: StoryCard, index: number) => {
    const el = cardsRef.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      setActiveCard({
        card,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      });
    }
  };

  // Hover Handlers for GSAP
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const inner = e.currentTarget.querySelector('.card-inner');
    if (inner) {
        gsap.to(inner, {
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.15)", // Golden shadow
            borderColor: "rgba(212, 175, 55, 0.3)",
            duration: 0.4,
            ease: "power2.out"
        });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const inner = e.currentTarget.querySelector('.card-inner');
    if (inner) {
        gsap.to(inner, {
            scale: 1,
            boxShadow: "none",
            borderColor: "rgba(212, 175, 55, 0.1)", // Default border
            duration: 0.4,
            ease: "power2.out"
        });
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-parchment selection:bg-gold-500 selection:text-navy-950 perspective-[2000px] overflow-x-hidden">
      
      {/* Background Layer */}
      <GeometricBackground isExpanded={isExpanded} />

      {/* Loading Sequence */}
      {loading && <IntroSequence onComplete={() => setLoading(false)} />}

      {/* Main Content */}
      <div 
        ref={mainRef}
        className={`relative z-10 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-30 mix-blend-difference pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="relative group">
               <ShipWheel className="text-gold-400 animate-[spin_12s_linear_infinite] group-hover:animate-[spin_4s_linear_infinite]" size={48} strokeWidth={1} />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-gold-500 rounded-full"></div>
               </div>
            </div>
            <div className="leading-none border-l border-gold-500/50 pl-4">
              <span className="block font-serif text-xl font-bold tracking-widest text-parchment">BTF</span>
              <span className="block text-[9px] tracking-[0.4em] text-gold-400 uppercase">Seafood Logic</span>
            </div>
          </div>
          <button className="pointer-events-auto p-4 group">
            <div className="space-y-1.5">
               <div className="w-8 h-[1px] bg-gold-400 group-hover:w-10 transition-all"></div>
               <div className="w-6 h-[1px] bg-gold-400 group-hover:w-10 transition-all delay-75"></div>
               <div className="w-4 h-[1px] bg-gold-400 group-hover:w-10 transition-all delay-100"></div>
            </div>
          </button>
        </nav>

        {/* Hero Section with Parallax Image */}
        <header className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 perspective-[1000px] overflow-hidden">
          
          {/* Hero Parallax Image */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-navy-950/70 z-10 mix-blend-multiply" />
             <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-transparent to-navy-950 z-10" />
             <img 
                ref={heroImageRef}
                src="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2070&auto=format&fit=crop" 
                alt="Deep Ocean" 
                className="w-full h-[140%] object-cover opacity-60"
             />
          </div>

          <div className="max-w-5xl text-center space-y-12 transform-style-3d relative z-20">
            <div className="flex justify-center gap-8 text-gold-500/60 font-mono text-xs tracking-widest">
              <span>LAT 08°58′N</span>
              <span>LON 79°32′W</span>
              <span>DEPTH 200m</span>
            </div>

            <h1 className="text-7xl md:text-[9rem] font-serif leading-[0.85] text-parchment mix-blend-overlay opacity-90 drop-shadow-2xl">
              FROM CHAOS<br/>
              <span className="text-gold-400 italic font-light">COMES STRUCTURE</span>
            </h1>
            
            <p className="max-w-lg mx-auto text-parchment/60 leading-relaxed text-lg tracking-wide border-t border-b border-parchment/10 py-6">
              A vertically integrated seafood logic. We impose scientific order on the wild ocean to deliver quality that surpasses fresh.
            </p>

            <div className="pt-20">
               <div className="w-[1px] h-32 bg-gradient-to-b from-gold-500 via-gold-500/50 to-transparent mx-auto"></div>
            </div>
          </div>
        </header>

        {/* Scrollable Feed */}
        <main className="max-w-6xl mx-auto px-6 pb-40 space-y-40">
          {STORY_CARDS.map((card, index) => (
            <div 
              key={card.id}
              ref={el => cardsRef.current[index] = el}
              className="group cursor-pointer relative perspective-[1000px] opacity-0 will-change-transform"
              onClick={() => handleCardClick(card, index)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Inner Wrapper for Hover Effect (Separated from Scroll Transform) */}
              <div className="card-inner relative flex flex-col md:flex-row gap-0 md:gap-12 items-stretch p-6 border border-gold-500/10 rounded-sm bg-navy-900/20 backdrop-blur-sm transition-none">
                
                {/* 1. Technical Data Sidebar */}
                <div className="w-full md:w-1/12 py-6 md:py-0 md:border-r border-gold-500/20 flex flex-row md:flex-col justify-between items-start md:items-end pr-6 text-right">
                   <span className="font-serif text-3xl text-gold-500 opacity-50">{card.id}</span>
                   <Compass className="text-gold-500/40 hidden md:block rotate-45 group-hover:rotate-0 transition-transform duration-700" size={24} strokeWidth={1} />
                </div>

                {/* 2. Main Content Block */}
                <div className="w-full md:w-5/12 flex flex-col justify-center space-y-6 z-20 md:py-6">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase">{card.type}</span>
                   </div>
                   
                   <h3 className="text-4xl md:text-5xl font-serif text-parchment group-hover:text-gold-100 transition-colors">
                     {card.title}
                   </h3>
                   
                   <p className="text-sm font-sans text-parchment/60 leading-relaxed border-l-2 border-gold-500/30 pl-4">
                     {card.description}
                   </p>

                   <div className="flex items-center gap-4 text-gold-400 text-xs tracking-widest pt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span>INITIATE SEQUENCE</span>
                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                   </div>
                </div>

                {/* 3. Image Portal */}
                <div className="w-full md:w-6/12 relative h-[50vh] md:h-[450px] overflow-hidden bg-navy-900 shadow-2xl">
                  <div className="absolute inset-0 bg-navy-950/40 z-10 group-hover:bg-transparent transition-colors duration-700 mix-blend-multiply" />
                  
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out grayscale-[30%] group-hover:grayscale-0"
                  />
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-end z-20 bg-gradient-to-t from-navy-950 to-transparent">
                     <span className="font-mono text-[10px] text-gold-400">{card.coordinates}</span>
                     <span className="font-mono text-[10px] text-parchment/50">IMG_SEQ_{card.id}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer className="text-center py-24 border-t border-parchment/5 relative overflow-hidden mt-20">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent"></div>
           <Anchor className="mx-auto text-gold-500 mb-8 opacity-80" size={64} strokeWidth={0.5} />
           <p className="font-serif text-4xl text-parchment mb-4 tracking-tight">Better Than Fresh</p>
           <div className="flex justify-center gap-8 font-sans text-[10px] tracking-[0.3em] text-gold-500/60 uppercase">
              <span>Processing</span>
              <span>Logistics</span>
              <span>Custody</span>
           </div>
        </footer>
      </div>

      {/* Expanded Overlay */}
      {activeCard && (
        <ContentOverlay 
          card={activeCard.card} 
          initialRect={activeCard.rect}
          onClose={() => setActiveCard(null)} 
        />
      )}
    </div>
  );
};

export default App;

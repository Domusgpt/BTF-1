import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GeometricBackground } from './components/GeometricBackground';
import { IntroSequence } from './components/IntroSequence';
import { ContentOverlay } from './components/ContentOverlay';
import { STORY_CARDS } from './constants';
import { StoryCard, GeometryState, Rect } from './types';
import { ArrowRight, Compass, Menu, GripHorizontal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<{ card: StoryCard; rect: Rect } | null>(null);
  const [geoState, setGeoState] = useState<GeometryState>({
    mouseX: 0,
    mouseY: 0,
    isExpanded: false
  });

  const mainRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setGeoState(prev => ({
        ...prev,
        mouseX: e.clientX,
        mouseY: e.clientY
      }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync geometry state with active card
  useEffect(() => {
    setGeoState(prev => ({ ...prev, isExpanded: !!activeCard }));
  }, [activeCard]);

  // "Chaos to Structure" & Z-Axis Scroll Animation
  useEffect(() => {
    if (loading) return;

    // 1. Initial Chaos Animation
    // Elements start scattered and snap into place
    const cards = cardsRef.current;
    
    gsap.fromTo(cards, 
      { 
        x: () => Math.random() * 400 - 200,
        y: () => Math.random() * 400 + 100,
        rotation: () => Math.random() * 20 - 10,
        opacity: 0,
        scale: 0.8
      },
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: 'expo.out',
        clearProps: 'all' // Important to clear transform for hover effects later
      }
    );

    // 2. Z-Axis Scroll Depth
    // As we scroll, items float "up" from the depths
    cards.forEach((card) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        y: -50, // Slight parallax upward
        scale: 1.05, // Slight growth as it approaches center
        ease: "none"
      });
    });

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

  return (
    <div className="relative min-h-screen font-sans text-parchment selection:bg-gold-500 selection:text-navy-950 perspective-[2000px] overflow-x-hidden">
      
      {/* Background Layer */}
      <GeometricBackground 
        mouseX={geoState.mouseX} 
        mouseY={geoState.mouseY} 
        isExpanded={geoState.isExpanded} 
      />

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
            <div className="relative">
               <Compass className="text-gold-400 animate-[spin_12s_linear_infinite]" size={40} strokeWidth={1} />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
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

        {/* Hero Section - Z-Axis Depth */}
        <header className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 perspective-[1000px]">
          <div className="max-w-5xl text-center space-y-12 transform-style-3d">
            
            <div className="flex justify-center gap-8 text-gold-500/60 font-mono text-xs tracking-widest">
              <span>LAT 08°58′N</span>
              <span>LON 79°32′W</span>
              <span>DEPTH 200m</span>
            </div>

            <h1 className="text-7xl md:text-[9rem] font-serif leading-[0.85] text-parchment mix-blend-overlay opacity-90">
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
              className="group cursor-pointer relative perspective-[1000px]"
              onClick={() => handleCardClick(card, index)}
            >
              {/* Card Container - Floating Effect */}
              <div className="relative flex flex-col md:flex-row gap-0 md:gap-12 items-stretch hover:translate-z-10 transition-transform duration-500">
                
                {/* 1. Technical Data Sidebar */}
                <div className="w-full md:w-1/12 py-6 md:py-0 border-t md:border-t-0 md:border-r border-gold-500/20 flex flex-row md:flex-col justify-between items-start md:items-end pr-6 text-right">
                   <span className="font-serif text-3xl text-gold-500 opacity-50">{card.id}</span>
                   <GripHorizontal className="text-gold-500/30 hidden md:block" />
                </div>

                {/* 2. Main Content Block */}
                <div className="w-full md:w-5/12 flex flex-col justify-center space-y-6 z-20 md:py-12">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase">{card.type}</span>
                   </div>
                   
                   <h3 className="text-5xl font-serif text-parchment group-hover:text-gold-100 transition-colors">
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

                {/* 3. Image Portal (The "Window" into the ocean) */}
                <div className="w-full md:w-6/12 relative h-[60vh] md:h-[500px] overflow-hidden bg-navy-900 group-hover:shadow-[0_0_50px_rgba(212,175,55,0.1)] transition-shadow duration-700">
                  <div className="absolute inset-0 bg-navy-950/40 z-10 group-hover:bg-transparent transition-colors duration-700 mix-blend-multiply" />
                  
                  {/* Image that zooms on hover */}
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out grayscale-[30%] group-hover:grayscale-0"
                  />
                  
                  {/* Technical Overlays */}
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
        <footer className="text-center py-24 border-t border-parchment/5 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent"></div>
           <Compass className="mx-auto text-gold-500 mb-8 animate-spin-slow opacity-80" size={64} strokeWidth={0.5} />
           <p className="font-serif text-4xl text-parchment mb-4 tracking-tight">Better Than Fresh</p>
           <div className="flex justify-center gap-8 font-sans text-[10px] tracking-[0.3em] text-gold-500/60 uppercase">
              <span>Processing</span>
              <span>Logistics</span>
              <span>Custody</span>
           </div>
        </footer>
      </div>

      {/* Expanded Overlay - "Domus" Effect */}
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
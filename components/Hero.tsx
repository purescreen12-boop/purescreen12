
import React, { useEffect, useRef, useState } from 'react';
import { Play, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User, Movie } from '../types';
import { LayoutTextFlip } from './ui/layout-text-flip';
import MobileNavBar from './MobileNavBar';

interface HeroProps {
  user: User | null;
}

const Hero: React.FC<HeroProps> = ({ user }) => {
  const [showNav, setShowNav] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const lastScrollY = useRef(window.scrollY);

  // Fetch trending movies
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/list-films');
        if (response.ok) {
          const data = await response.json();
          const sorted = [...data].sort((a: Movie, b: Movie) => parseInt(b.id) - parseInt(a.id));
          setTrendingMovies(sorted.slice(0, 5));
        }
      } catch (error) {
        console.log('Error fetching trending movies:', error);
      }
    };

    fetchTrendingMovies();
  }, []);

  const hideTimerRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (trendingMovies.length === 0) {
      setShowNotification(false);
      return;
    }

    const clearTimers = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const scheduleNext = () => {
      setCurrentMovieIndex((prev) => (prev + 1) % trendingMovies.length);
      setShowNotification(true);

      hideTimerRef.current = window.setTimeout(() => {
        setShowNotification(false);
        showTimerRef.current = window.setTimeout(scheduleNext, 5000);
      }, 5000);
    };

    setCurrentMovieIndex(0);
    setShowNotification(true);

    hideTimerRef.current = window.setTimeout(() => {
      setShowNotification(false);
      showTimerRef.current = window.setTimeout(scheduleNext, 5000);
    }, 5000);

    return () => {
      clearTimers();
    };
  }, [trendingMovies]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth > 768) {
        setShowNav(false);
        return;
      }
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <section className="relative min-h-[50vh] w-full flex items-start px-8 md:px-16 pt-32 md:pt-32 pb-20 overflow-hidden">
      {/* Background with cinematic overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-600"
        style={{ backgroundImage:
           `url('/come.png')`, backgroundPosition: '30% 40%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
       <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
           
            <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.4em]">
              WELCOME</span>
          </div>
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-[1.1] tracking-tighter">
            <LayoutTextFlip
              text="Watch Inspiring"
              words={[""]}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold"
            />
            <br />
            <span className="text-[#d4af37] font-serif">Stories.</span>
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl text-gray-300 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl leading-relaxed font-light px-2 sm:px-0">
          <i> we bring you the ultimate home of entertainment you can trust...</i>
          </p>
        </div>
        <div className="flex flex-wrap gap-5 pt-4">
          <Link 
            to="/browse"
            className="px-12 py-5 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#c49f27] transition-all flex items-center gap-3 transform hover:scale-105 shadow-2xl shadow-[#d4af37]/30"
          >
            <Play fill="black" size={24} />
            Get Started
          </Link>
          {user && (
            <Link 
              to="https://discord.gg/QqbVGmSG8"
              className="px-12 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 shadow-xl"
            >
              <UserPlus size={24} />
              Join Community
            </Link>
          )}

        {/* Hot Now Notification Toast */}
      <div className={`fixed z-50 transition-all duration-500 ${showNotification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} md:top-6 md:right-6 md:translate-y-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:transform-none`}>
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl border border-red-500/50 max-w-sm hover:shadow-red-600/50">
          <div className="h-12 w-12 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0 bg-white/10">
            <Play fill="white" size={20} className="ml-0.5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-serif font-bold text-white">{trendingMovies[currentMovieIndex]?.title || 'Featured Now'}</h3>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-bold rounded uppercase tracking-wider">Hot Now</span>
            </div>
            <p className="text-xs text-white/90">{trendingMovies[currentMovieIndex]?.description?.substring(0, 30) || 'Inspiring stories streaming now'}... - Streaming Now</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0 ml-2"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
      </div>
        </div>

      
        
      </div>
      </section>
      <MobileNavBar showNav={showNav} />
    </>
  );
}

export default Hero;

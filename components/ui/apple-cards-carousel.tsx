'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlowingEffect } from './glowing-effect';

interface CardProps {
  card: {
    category: string;
    title: string;
    src: string;
    content?: React.ReactNode;
    movieId?: string;
  };
  index: number;
  onCardClick?: (movieId?: string) => void;
}

export const Card: React.FC<CardProps> = ({ card, index, onCardClick }) => {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(card.movieId);
    }
  };

  return (
    <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56 px-1 sm:px-0">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      >
        <div
          onClick={handleClick}
          className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
        >
        {/* Background Image */}
        <img
          src={card.src}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-1.5 sm:p-2 md:p-3">
          <div className="transform transition-all duration-300">
            <span className="inline-block text-[#d4af37] text-[6px] sm:text-[7px] md:text-[8px] font-semibold uppercase tracking-widest mb-0.5">
              {card.category}
            </span>
            <h3 className="text-white text-[9px] sm:text-[10px] md:text-xs font-bold leading-tight line-clamp-2">
              {card.title}
            </h3>
          </div>
        </div>

      </div>
      </GlowingEffect>
    </div>
  );
};

interface CarouselProps {
  items: React.ReactNode[];
}

export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full relative py-0 -top-3 sm:-top-4 md:-top-5 lg:-top-7">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-1 transition-all duration-300 hidden sm:flex items-center justify-center"
        >
          <ChevronLeft size={14} className="text-white" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scroll-smooth px-1 sm:px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-1 transition-all duration-300 hidden sm:flex items-center justify-center"
        >
          <ChevronRight size={14} className="text-white" />
        </button>
      )}
    </div>
  );
};

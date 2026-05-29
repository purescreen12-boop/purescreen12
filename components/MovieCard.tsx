
import React from 'react';
import { Play, Calendar } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  variant?: 'portrait' | 'landscape';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, variant = 'landscape' }) => {
  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative cursor-pointer overflow-hidden
       rounded-md transition-all duration-300 hover:z-10"
    >
      <div className={`aspect-[16/9] w-full relative`}>
        <img 
          src={movie.thumbnail} 
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-[#d4af37]/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
            <Play fill="black" size={20} className="ml-1" />
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-gray-200 group-hover:text-[#d4af37] transition-colors line-clamp-1">{movie.title}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{movie.category}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5">
          <Calendar size={10} className="text-[#d4af37]/60" />
          <span>{movie.year}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

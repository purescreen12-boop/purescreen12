import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  Carousel,
  Slider,
  SliderContainer,
  SliderDotButton,
} from './ui/carousel';
import MovieCard from './MovieCard';
import AutoScroll from 'embla-carousel-auto-scroll';

interface MovieSliderProps {
  movies: any[];
  onMovieSelect: (movie: any) => void;
}

export default function MovieSlider({ movies, onMovieSelect }: MovieSliderProps) {
  const OPTIONS: EmblaOptionsType = { loop: true, align: 'center' };
  const PLUGINS = [
    AutoScroll({
      speed: 2,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      startDelay: 100,
    }),
  ];

  return (
    <div className="w-full relative">
      <Carousel options={OPTIONS} plugins={PLUGINS}>
        <SliderContainer>
          {movies.map((movie, index) => (
            <Slider key={movie.id} className="sm:w-[65%] w-[90%]  flex-shrink-0">
              <div className="animate-in fade-in zoom-in "  style={{ animationDelay: `${index * 100}ms` }}>
                <MovieCard
                  movie={movie}
                  onClick={onMovieSelect}
                  variant="ranked"
                  rank={index + 1}
                />
              </div>
            </Slider>
          ))}
        </SliderContainer>

        {/* Dot Buttons */}
        <div className="flex justify-center py-6 mt-4">
          <SliderDotButton />
        </div>
      </Carousel>
    </div>
  );
}

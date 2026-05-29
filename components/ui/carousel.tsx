import React, { useCallback, useEffect, useState } from 'react';
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';

type CarouselProps = {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  isScale?: boolean;
};

export const Carousel: React.FC<CarouselProps> = ({
  children,
  options = {},
  plugins = [],
  isScale = false,
}) => {
  const [viewportRef, emblaApi] = useEmblaCarousel(
    { ...options },
    plugins
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const handleSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', handleSelect);
    handleSelect(emblaApi);

    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi, handleSelect]);

  return (
    <CarouselContext.Provider value={{ emblaApi, selectedIndex, scrollSnaps, isScale }}>
      <div ref={viewportRef} className="overflow-hidden w-full">
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

type CarouselContextType = {
  emblaApi: EmblaCarouselType | undefined;
  selectedIndex: number;
  scrollSnaps: number[];
  isScale: boolean;
};

const CarouselContext = React.createContext<CarouselContextType>({
  emblaApi: undefined,
  selectedIndex: 0,
  scrollSnaps: [],
  isScale: false,
});

export const SliderContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const { isScale } = React.useContext(CarouselContext);
  return (
    <div
      className={`flex gap-2 ${isScale ? 'justify-center items-center' : ''} ${className}`}
      style={
        isScale
          ? {
              willChange: 'transform',
            }
          : {}
      }
    >
      {children}
    </div>
  );
};

interface SliderProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export const Slider: React.FC<SliderProps> = ({ children, className = '', index = 0 }) => {
  const { isScale, selectedIndex } = React.useContext(CarouselContext);

  const isSelected = selectedIndex === index;

  if (isScale) {
    return (
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
        } ${className}`}
        style={{
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 w-full ${className}`}>
      {children}
    </div>
  );
};

interface SliderButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: React.ReactNode;
}

export const SliderPrevButton: React.FC<SliderButtonProps> = ({
  className = '',
  ...props
}) => {
  const { emblaApi } = React.useContext(CarouselContext);
  const [canScroll, setCanScroll] = React.useState(false);

  const handleClick = () => {
    emblaApi?.scrollPrev();
  };

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateCanScroll = () => {
      setCanScroll(emblaApi.canScrollPrev());
    };

    updateCanScroll();
    emblaApi.on('select', updateCanScroll);
    emblaApi.on('reInit', updateCanScroll);

    return () => {
      emblaApi.off('select', updateCanScroll);
      emblaApi.off('reInit', updateCanScroll);
    };
  }, [emblaApi]);

  return (
    <button
      onClick={handleClick}
      disabled={!canScroll}
      className={className}
      {...props}
    >
      {props.children}
    </button>
  );
};

export const SliderNextButton: React.FC<SliderButtonProps> = ({
  className = '',
  ...props
}) => {
  const { emblaApi } = React.useContext(CarouselContext);
  const [canScroll, setCanScroll] = React.useState(false);

  const handleClick = () => {
    emblaApi?.scrollNext();
  };

  React.useEffect(() => {
    if (!emblaApi) return;

    const updateCanScroll = () => {
      setCanScroll(emblaApi.canScrollNext());
    };

    updateCanScroll();
    emblaApi.on('select', updateCanScroll);
    emblaApi.on('reInit', updateCanScroll);

    return () => {
      emblaApi.off('select', updateCanScroll);
      emblaApi.off('reInit', updateCanScroll);
    };
  }, [emblaApi]);

  return (
    <button
      onClick={handleClick}
      disabled={!canScroll}
      className={className}
      {...props}
    >
      {props.children}
    </button>
  );
};

export const SliderDotButton: React.FC<SliderButtonProps & { children?: React.ReactNode }> = ({
  className = '',
  ...props
}) => {
  const { emblaApi, scrollSnaps, selectedIndex } = React.useContext(CarouselContext);

  return (
    <div className="flex gap-2">
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => emblaApi?.scrollTo(index)}
          className={`w-2 h-2 rounded-full transition-all ${
            index === selectedIndex
              ? 'bg-[#d4af37] w-8'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
          {...props}
        />
      ))}
    </div>
  );
};

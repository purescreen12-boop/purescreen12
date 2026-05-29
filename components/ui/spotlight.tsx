import React from 'react';
import { cn } from '../../utils/cn';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  className = '',
  fill = 'white',
}) => {
  return (
    <svg
      className={cn(
        'absolute pointer-events-none animate-pulse',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      width="100%"
      height="100%"
    >
      <g filter="url(#filter0_f_1019_2)">
        <circle
          cx="1894.5"
          cy="273"
          r="554"
          fill={fill}
          fillOpacity="0.5"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_1019_2"
          x="840.5"
          y="-281"
          width="2108"
          height="2108"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="300" />
        </filter>
      </defs>
    </svg>
  );
};

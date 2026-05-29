import React from 'react';

interface WaveDividerProps {
  className?: string;
}

const WaveDivider: React.FC<WaveDividerProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-16 overflow-hidden bg-gradient-to-b from-transparent to-transparent ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          {/* Main gradient using website colors - Gold palette */}
          <linearGradient id="waveGradientPro" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9a7f1f" stopOpacity="1" />
            <stop offset="25%" stopColor="#d4af37" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffed4e" stopOpacity="1" />
            <stop offset="75%" stopColor="#d4af37" stopOpacity="1" />
            <stop offset="100%" stopColor="#9a7f1f" stopOpacity="1" />
          </linearGradient>

          {/* Glow effect */}
          <filter id="waveShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            <feOffset dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle gradient for background accent */}
          <linearGradient id="waveAccent" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Main wave stroke */}
        <path
          d="M 0,60 Q 150,30 300,60 T 600,60 T 900,60 T 1200,60"
          stroke="url(#waveGradientPro)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#waveShadow)"
          opacity="1"
        />

        {/* Secondary subtle wave for depth */}
        <path
          d="M 0,65 Q 150,40 300,65 T 600,65 T 900,65 T 1200,65"
          stroke="#d4af37"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />

        {/* Accent glow underneath */}
        <path
          d="M 0,62 Q 150,35 300,62 T 600,62 T 900,62 T 1200,62 L 1200,120 L 0,120 Z"
          fill="url(#waveAccent)"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

export default WaveDivider;

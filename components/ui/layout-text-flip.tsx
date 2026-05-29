import React from 'react';
import './layout-text-flip.css';

interface LayoutTextFlipProps {
  text: string;
  words: string[];
  className?: string;
}

export const LayoutTextFlip: React.FC<LayoutTextFlipProps> = ({
  text,
  words,
  className = ''
}) => {
  return (
    <div className={`layout-text-flip ${className}`}>
      <span className="static-text">{text}</span>
      <div className="flip-container">
        <div className="flipper">
          {words.map((word, index) => (
            <div key={index} className="flip-item">
              {word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


"use client";
import React from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  words,
  className = "",
  filter = true,
  duration = 5,
}) => {
  const arr = words.split(" ");
  
  return (
    <div className={className}>
      <style>{`
        @keyframes fadeBlurIn {
          from {
            opacity: 0;
            ${filter ? 'filter: blur(10px);' : ''}
          }
          to {
            opacity: 1;
            ${filter ? 'filter: blur(0px);' : ''}
          }
        }
        .text-generate-word {
          display: inline-block;
          animation: fadeBlurIn 0.5s ease-out forwards;
        }
      `}</style>
      {arr.map((word, idx) => (
        <span
          key={word + idx}
          className="text-generate-word"
          style={{
            animationDelay: `${idx * duration}s`,
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </div>
  );
};

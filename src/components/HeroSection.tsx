
import React from 'react';
import { SearchTools } from './SearchTools';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden py-10 md:py-16 flex flex-col items-center text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent"></div>
      <div className="animate-slide-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          Dev Utility Toolkit
        </h1>
      </div>
      <div className="animate-slide-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Collection of free utilities for developers and designers. Format, encode, decode, compress, and more.
        </p>
      </div>
      <div className="animate-slide-in opacity-0 w-full max-w-lg" style={{ animationFillMode: 'forwards', animationDelay: '300ms' }}>
        <SearchTools onSearch={onSearch} />
      </div>
    </div>
  );
}

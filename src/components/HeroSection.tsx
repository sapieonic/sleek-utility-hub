
import React from 'react';
import { SearchTools } from './SearchTools';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden py-6 sm:py-10 md:py-16 flex flex-col items-center text-center px-4 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent"></div>
      <div className="animate-slide-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '100ms' }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
          Dev Utility Toolkit
        </h1>
      </div>
      <div className="animate-slide-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '200ms' }}>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl px-4">
          Collection of free utilities for developers and designers. Format, encode, decode, compress, and more.
        </p>
      </div>
      <div className="animate-slide-in opacity-0 w-full max-w-lg px-4" style={{ animationFillMode: 'forwards', animationDelay: '300ms' }}>
        <SearchTools onSearch={onSearch} />
      </div>
    </div>
  );
}

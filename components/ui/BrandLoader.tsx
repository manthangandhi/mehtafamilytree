import React from 'react';
import { BrandLogo } from './BrandLogo';

export function BrandLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[40vh]">
      <div className="animate-pulse mb-6">
        <BrandLogo showText={false} className="scale-125" />
      </div>
      <p className="font-serif text-lg text-primary/80 animate-pulse tracking-wide font-medium">
        {text}
      </p>
    </div>
  );
}

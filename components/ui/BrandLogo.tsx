import React from 'react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export function BrandLogo({ className, showText = true }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Image 
          src="/images/logo-simple.png" 
          alt="Mehta Kutumb Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-serif font-bold text-xl tracking-tight">
          Mehta Kutumb
        </span>
      )}
    </div>
  );
}

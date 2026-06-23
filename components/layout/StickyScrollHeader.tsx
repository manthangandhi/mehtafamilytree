'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  backLink: string;
  backText?: string;
}

export function StickyScrollHeader({ title, subtitle, backLink, backText = "Back" }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky header after scrolling down 250px
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position just in case
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className={`fixed top-14 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/60 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link 
            href={backLink}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-surface-hover border border-border/80 text-muted hover:text-foreground hover:bg-border/40 transition-colors"
            title={backText}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="flex items-baseline gap-3 min-w-0 overflow-hidden">
            <h2 className="font-serif font-bold text-foreground text-[15px] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {title}
            </h2>
            {subtitle && (
              <span className="hidden sm:inline-block text-xs font-medium text-muted truncate max-w-[150px] md:max-w-xs uppercase tracking-wider">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

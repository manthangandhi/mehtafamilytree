"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full bg-primary pt-32 pb-40 px-6 mt-[-64px]">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M0 40V0H40" fill="none" stroke="white" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)"/>
           </svg>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            The Future of Family History
          </div>
          
          <h1 className="font-serif text-[56px] leading-[1.1] md:text-[80px] md:leading-[1.05] font-bold tracking-[-0.02em] text-white mb-8">
            Preserve your <span className="text-accent italic font-light">legacy.</span>
          </h1>
          
          <p className="font-sans text-[20px] md:text-[24px] leading-relaxed text-white/80 max-w-3xl mb-12">
            A secure, living digital replacement for the traditional printed family directory. Find relatives, trace your lineage, and stay connected across the globe.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            <Link href="/directory" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-primary font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(200,169,126,0.3)] transition-all duration-300">
                Explore Directory
              </button>
            </Link>
            <Link href="/family-tree" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-14 px-8 rounded-full bg-transparent border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300">
                View Family Tree
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-20 relative z-20 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card md:col-span-2 row-span-2 p-0 flex flex-col overflow-hidden relative group shadow-2xl">
            <div className="p-12 relative z-10 flex-1 bg-gradient-to-b from-surface/90 to-transparent">
              <h3 className="font-serif text-[36px] leading-[44px] font-bold text-foreground mb-4">One Family.</h3>
              <p className="font-sans text-[18px] leading-[28px] text-muted max-w-lg">Growing stronger across generations and borders. Navigate the interactive family tree to discover connections you never knew existed.</p>
            </div>
            <div className="w-full h-72 sm:h-96 relative overflow-hidden bg-surface-hover">
               <img src="/images/hero-tree.png" alt="Heritage Family Tree" className="w-full h-full object-cover object-bottom transition-transform duration-[1.5s] group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </div>

          <div className="premium-card min-h-[260px] p-10 flex flex-col justify-center text-left hover:border-accent/40 group shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-surface border border-border text-accent flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="font-serif text-[24px] leading-[30px] font-bold text-foreground mb-3">Privacy First.</h3>
            <p className="font-sans text-[15px] leading-[22px] text-muted">Contact details and sensitive records are restricted to approved members only, ensuring your data never leaves the family fold.</p>
          </div>

          <div className="premium-card min-h-[260px] p-10 flex flex-col justify-center text-left hover:border-accent/40 group shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-surface border border-border text-accent flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <h3 className="font-serif text-[24px] leading-[30px] font-bold text-foreground mb-3">Verified Roots.</h3>
            <p className="font-sans text-[15px] leading-[22px] text-muted">Every household submission is manually reviewed by family administrators to ensure a 100% accurate historical record.</p>
          </div>
        </div>
      </div>
    </>
  );
}

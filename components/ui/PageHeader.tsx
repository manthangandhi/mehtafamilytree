import React from 'react';
import { FloralBackground } from '@/components/ui/FloralBackground';

interface PageHeaderProps {
  title: string;
  description?: string;
  note?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, note, icon, action }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
      <FloralBackground opacity="0.10" />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            {icon && (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                {icon}
              </div>
            )}
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                {title}
              </h1>
              {description && (
                <p className="text-[16px] text-white/90 font-medium drop-shadow-sm max-w-xl">
                  {description}
                </p>
              )}
              {note && (
                <p className="mt-1.5 text-[11px] uppercase tracking-widest text-white/60 font-bold drop-shadow-sm">
                  {note}
                </p>
              )}
            </div>
          </div>
          
          {action && (
            <div>{action}</div>
          )}
        </div>
      </div>
    </div>
  );
}

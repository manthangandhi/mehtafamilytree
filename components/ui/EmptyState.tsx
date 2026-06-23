import React from 'react';
import { cn } from '@/components/ui/Button'; // using cn for class merging

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6 premium-card bg-surface-hover/50", className)}>
      {icon ? (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent ring-8 ring-accent/5">
          {icon}
        </div>
      ) : (
        <div className="mb-6 opacity-30 mix-blend-luminosity grayscale">
          {/* Subtle fallback watermark if no icon provided */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M32 51 L32 57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
             <line x1="32" y1="49" x2="32" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
             <path d="M32 22 Q 19 27 14 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
             <path d="M32 22 Q 45 27 50 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      )}
      <h3 className="font-serif text-2xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted text-[15px] max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

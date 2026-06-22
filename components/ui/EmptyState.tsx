import React from 'react';

export function EmptyState({ title, description, action }: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-gradient-to-b from-background to-surface-hover py-12 px-6 text-center animate-fade-in">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

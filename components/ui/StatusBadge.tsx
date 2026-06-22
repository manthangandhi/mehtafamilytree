import React from 'react';

interface Props {
  status: string;
  type?: 'user' | 'request' | 'household';
  variant?: 'default' | 'light';
}

const colors: Record<string, string> = {
  pending: 'bg-primary/10 text-primary',
  approved: 'bg-primary/10 text-primary',
  rejected: 'bg-accent/10 text-accent',
  blocked: 'bg-surface-hover text-muted',
  active: 'bg-primary/10 text-primary',
  inactive: 'bg-surface-hover text-muted',
  member: 'bg-primary/10 text-primary', // mapped
  admin: 'bg-accent/10 text-accent', // mapped
};

const lightColors: Record<string, string> = {
  pending: 'bg-white/20 text-white border border-white/30',
  approved: 'bg-white/20 text-white border border-white/30',
  rejected: 'bg-red-500/20 text-red-100 border border-red-500/30',
  blocked: 'bg-gray-500/20 text-gray-100 border border-gray-500/30',
  active: 'bg-white/20 text-white border border-white/30',
  inactive: 'bg-gray-500/20 text-gray-100 border border-gray-500/30',
  member: 'bg-white/20 text-white border border-white/30',
  admin: 'bg-amber-500/20 text-amber-100 border border-amber-500/30',
};

export function StatusBadge({ status, type, variant = 'default' }: Props) {
  const cls = variant === 'light' 
    ? (lightColors[status] || 'bg-white/10 text-white')
    : (colors[status] || 'bg-surface text-muted');
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${cls}`}>{label}</span>;
}

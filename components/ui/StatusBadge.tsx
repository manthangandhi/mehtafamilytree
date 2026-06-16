import React from 'react';

interface Props {
  status: string;
  type?: 'user' | 'request' | 'household';
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

export function StatusBadge({ status, type }: Props) {
  const cls = colors[status] || 'bg-surface text-muted';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${cls}`}>{label}</span>;
}

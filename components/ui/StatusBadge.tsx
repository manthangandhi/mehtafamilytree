import React from 'react';

interface Props {
  status: string;
  type?: 'user' | 'request' | 'household';
}

const colors: Record<string, string> = {
  pending: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  blocked: 'bg-surface-hover text-stone-700',
  active: 'bg-emerald-50 text-emerald-800',
  inactive: 'bg-surface-hover text-stone-700',
  member: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
};

export function StatusBadge({ status, type }: Props) {
  const cls = colors[status] || 'bg-surface text-stone-700';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${cls}`}>{label}</span>;
}

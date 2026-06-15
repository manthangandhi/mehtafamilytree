'use client';

import React from 'react';

/**
 * Privacy aware field renderer.
 * Shows value only for approved members/admins.
 * For visitors and pending, shows a subtle placeholder.
 */
export function PrivacyField({
  value,
  isApproved,
  label,
  placeholder = "—",
  sensitive = true,
}: {
  value?: string | null;
  isApproved: boolean;
  label?: string;
  placeholder?: string;
  sensitive?: boolean;
}) {
  if (!value) return <span className="text-muted">{placeholder}</span>;

  if (isApproved) {
    return <span>{value}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      <span>••••••••</span>
      {sensitive && <span className="text-[10px] font-mono tracking-widest text-primary/60">PRIVATE</span>}
    </span>
  );
}

'use client';

import React from 'react';

interface Props {
  current: any;
  proposed: any;
}

function DiffRow({ label, current, proposed }: { label: string; current: any; proposed: any }) {
  const changed = JSON.stringify(current) !== JSON.stringify(proposed);
  return (
    <div className="grid grid-cols-3 gap-3 border-b py-2 text-sm last:border-none">
      <div className="font-medium text-muted">{label}</div>
      <div className={changed ? 'text-red-600 line-through' : 'text-muted'}>
        {current === null || current === undefined || current === '' ? '—' : String(current)}
      </div>
      <div className={changed ? 'font-medium text-emerald-700' : ''}>
        {proposed === null || proposed === undefined || proposed === '' ? '—' : String(proposed)}
      </div>
    </div>
  );
}

export function RequestComparisonView({ current, proposed }: Props) {
  const keys = Array.from(new Set([...Object.keys(current || {}), ...Object.keys(proposed || {})]));

  return (
    <div className="rounded-lg border bg-surface p-4">
      <div className="mb-3 grid grid-cols-3 gap-3 text-xs font-semibold uppercase tracking-widest text-muted">
        <div>Field</div>
        <div>Current</div>
        <div>Proposed</div>
      </div>
      {keys.length === 0 && <div className="text-sm text-muted">No data to compare.</div>}
      {keys.map((k) => (
        <DiffRow key={k} label={k} current={current?.[k]} proposed={proposed?.[k]} />
      ))}
    </div>
  );
}

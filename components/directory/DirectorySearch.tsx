'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface Props {
  initialFilters?: Record<string, string>;
}

const relationshipOptions = [
  { value: '', label: 'Any relationship' },
  { value: 'SELF', label: 'Head of household' },
  { value: 'WIFE', label: 'Wife' },
  { value: 'SON', label: 'Son' },
  { value: 'DAUGHTER', label: 'Daughter' },
  { value: 'DAUGHTER IN LAW', label: 'Daughter in law' },
];

export function DirectorySearch({ initialFilters = {} }: Props) {
  const router = useRouter();

  // Memoize stringified filters to avoid infinite useEffect loop (Bug fix #4)
  const filterKey = useMemo(() => JSON.stringify(initialFilters), [initialFilters]);

  const [filters, setFilters] = useState({
    q: initialFilters.q || '',
    city: initialFilters.city || '',
    state: initialFilters.state || '',
    native_place: initialFilters.native_place || '',
    relationship: initialFilters.relationship || '',
    marital_status: initialFilters.marital_status || '',
    is_deceased: initialFilters.is_deceased || '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync local form state when the parent passes new initialFilters
  // Uses stringified comparison to prevent infinite re-renders
  useEffect(() => {
    const parsed = JSON.parse(filterKey);
    setFilters({
      q: parsed.q || '',
      city: parsed.city || '',
      state: parsed.state || '',
      native_place: parsed.native_place || '',
      relationship: parsed.relationship || '',
      marital_status: parsed.marital_status || '',
      is_deceased: parsed.is_deceased || '',
    });
    // Auto-expand advanced if any advanced filter is set
    if (parsed.city || parsed.state || parsed.native_place || parsed.relationship || parsed.marital_status || parsed.is_deceased) {
      setShowAdvanced(true);
    }
  }, [filterKey]);

  const handleChange = (key: string, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();
    router.push(query ? `/directory?${query}` : '/directory');
  };

  const clear = () => {
    const cleared = { q: '', city: '', state: '', native_place: '', relationship: '', marital_status: '', is_deceased: '' };
    setFilters(cleared);
    setShowAdvanced(false);
    router.push('/directory');
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <form onSubmit={submit} className="bg-surface card p-5 animate-fade-in border border-border shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          Search & Filter
        </div>
        {hasActiveFilters && (
          <span className="text-xs text-primary font-medium">Filters active</span>
        )}
      </div>

      {/* Main search */}
      <div className="relative">
        <Input
          placeholder="Search by name, place, or household..."
          value={filters.q}
          onChange={(e) => handleChange('q', e.target.value)}
          className="pl-10"
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>

      {/* Toggle advanced */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-3 text-xs text-primary hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
        {showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
      </button>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in border-t border-border/50 pt-4">
          <div>
            <div className="text-xs text-muted mb-1">City</div>
            <Input value={filters.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="City" />
          </div>
          <div>
            <div className="text-xs text-muted mb-1">State</div>
            <Input value={filters.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="State" />
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Native place</div>
            <Input value={filters.native_place} onChange={(e) => handleChange('native_place', e.target.value)} placeholder="Native place" />
          </div>

          <div>
            <div className="text-xs text-muted mb-1">Relationship to head</div>
            <Select value={filters.relationship} onChange={(e) => handleChange('relationship', e.target.value)} options={relationshipOptions} />
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Marital status</div>
            <Input value={filters.marital_status} onChange={(e) => handleChange('marital_status', e.target.value)} placeholder="married / single" />
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Alive / Deceased</div>
            <Select
              value={filters.is_deceased}
              onChange={(e) => handleChange('is_deceased', e.target.value)}
              options={[
                { value: '', label: 'All' },
                { value: 'false', label: 'Alive only' },
                { value: 'true', label: 'Deceased only' },
              ]}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary">Search Our Family</Button>
        {hasActiveFilters && (
          <Button type="button" variant="secondary" onClick={clear}>Clear all filters</Button>
        )}
      </div>

      <p className="mt-3 text-[11px] text-muted">
        Privacy protected — full contact details are shown only to approved family members.
      </p>
    </form>
  );
}

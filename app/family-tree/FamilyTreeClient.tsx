'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { calculateRelationship, getPersonName } from '@/lib/utils/kinship';

interface FamilyTreeClientProps {
  treeData: any[];
  allPersons?: any[];
  allRelationships?: any[];
}

export default function FamilyTreeClient({ treeData, allPersons = [], allRelationships = [] }: FamilyTreeClientProps) {
  const [search, setSearch] = useState('');
  const [personA, setPersonA] = useState('');
  const [personB, setPersonB] = useState('');
  const [relResult, setRelResult] = useState('');

  // Flatten persons for calculator from treeData if not provided
  const personsForCalc = useMemo(() => {
    if (allPersons && allPersons.length > 0) return allPersons;
    const map = new Map();
    treeData.forEach((h: any) => {
      (h.members || []).forEach((m: any) => {
        const p = m.person || m;
        if (p?.id) map.set(p.id, p);
      });
    });
    return Array.from(map.values());
  }, [treeData, allPersons]);

  const relsForCalc = useMemo(() => {
    if (allRelationships && allRelationships.length > 0) return allRelationships;
    const out: any[] = [];
    treeData.forEach((h: any) => (h.relationships || []).forEach((r: any) => out.push(r)));
    return out;
  }, [treeData, allRelationships]);

  const filtered = treeData.filter((unit: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      unit.primary_member_name?.toLowerCase().includes(q) ||
      unit.members?.some((m: any) => m.person?.full_name?.toLowerCase().includes(q))
    );
  });

  const runRelationship = () => {
    if (!personA || !personB) {
      setRelResult('Select two people');
      return;
    }
    const result = calculateRelationship(personA, personB, personsForCalc, relsForCalc);
    setRelResult(result);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pt-10">
      <div className="mb-12">
        <h1 className="font-serif text-[36px] leading-[44px] font-semibold text-foreground mb-4">Mehta Kutumb Lineage</h1>
        <p className="text-muted max-w-2xl text-lg">
          Connecting the threads of our lineage across generations. Discover kin through their legacy, expertise, and ancestral roots.
        </p>
      </div>

      <div className="flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              <div className="bg-surface-hover rounded-lg border border-border p-6">
                <h3 className="font-serif text-2xl font-bold mb-4">Filters</h3>
                <p className="text-muted text-sm mb-6">Refine the family tree to locate specific lineages or households.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Search Name</label>
                    <input type="text" placeholder="e.g. Mehta..." className="input" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Relationship Path Calculator - Family Tree Building Engine feature */}
              <div className="bg-surface rounded-xl border border-accent/40 p-6">
                <h3 className="font-serif text-xl font-semibold mb-2">Relationship Calculator</h3>
                <p className="text-xs text-muted mb-4">Select any two people to see their exact lineage connection (e.g. Second Cousin, Great Uncle). Powered by graph traversal.</p>

                <div className="space-y-3">
                  <div>
                    <label className="label text-xs">Person A</label>
                    <select className="input text-sm" value={personA} onChange={e => setPersonA(e.target.value)}>
                      <option value="">-- select --</option>
                      {personsForCalc.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.full_name || 'Unnamed'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Person B</label>
                    <select className="input text-sm" value={personB} onChange={e => setPersonB(e.target.value)}>
                      <option value="">-- select --</option>
                      {personsForCalc.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.full_name || 'Unnamed'}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={runRelationship} className="w-full text-sm">Calculate Relationship</Button>
                  {relResult && (
                    <div className="mt-2 p-3 rounded bg-accent/10 border border-accent/30 text-sm font-medium">
                      {relResult}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted mt-3">Uses persons + relationships + father/mother/spouse columns.</p>
              </div>
              
              <div className="rounded-2xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 bg-primary text-white relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="relative z-10">
                  <h4 className="font-serif text-xl font-bold mb-2">Privacy Vault</h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    Your heritage is sacred. We use secure access to ensure your data stays within the family fold.
                  </p>
                  <Button variant="ghost" className="text-sm font-bold flex items-center gap-2 hover:translate-x-1 transition-transform p-0 h-auto">
                    Manage Permissions <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Listing */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6 px-2 border-b border-border pb-3">
              <span className="text-xs font-bold text-muted tracking-widest uppercase">{filtered.length} HOUSEHOLDS FOUND</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((unit: any, i: number) => (
                <Link href={`/households/${unit.id}`} key={unit.id} className={`premium-card group flex flex-col p-5 animate-fade-in delay-${(i % 3) + 1} overflow-hidden hover:border-accent/40`}>
                  
                  {/* Top info area */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-serif text-[18px] font-bold text-foreground group-hover:text-primary transition-colors mb-0.5">{unit.primary_member_name}</h3>
                      <p className="text-xs text-muted font-medium">
                        {unit.city ? `${unit.city}, ` : ''}{unit.state || unit.country || 'Location Unknown'}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${unit.verified ? 'bg-success/10 text-success' : 'bg-surface-hover text-muted'}`}>
                      {unit.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  
                  {/* Bottom members area */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                    <div className="flex -space-x-2">
                      {unit.members?.slice(0, 4).map((m: any, idx: number) => (
                        <div key={idx} className="w-8 h-8 rounded-full ring-2 ring-surface bg-surface border border-border flex items-center justify-center text-primary font-serif font-bold text-xs shadow-sm">
                          {m.person?.full_name ? m.person.full_name.charAt(0) : '?'}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
              
              {filtered.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    title="No households found"
                    description="We couldn't find any households matching your search criteria."
                    action={
                      <Button variant="ghost" onClick={() => setSearch('')} className="text-sm font-medium text-accent hover:underline p-0 h-auto">
                        Clear filters
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

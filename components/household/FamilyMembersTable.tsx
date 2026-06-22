'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PrivacyField } from '@/components/ui/PrivacyField';
import { PersonDetailModal } from './PersonDetailModal';

interface FamilyMembersTableProps {
  members: any[];
  relationships: any[];
  isApproved: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  householdId: string;
}

export function FamilyMembersTable({ 
  members, 
  relationships, 
  isApproved, 
  isAdmin, 
  canEdit, 
  householdId 
}: FamilyMembersTableProps) {
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedRel, setSelectedRel] = useState<string>('');

  const openPerson = (hm: any) => {
    const p = hm.person || hm;
    setSelectedPerson(p);
    setSelectedRel(hm.relationship_to_head);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setSelectedRel('');
  };

  return (
    <>
      {/* Vertical list of members - no wide table, stacks cleanly, full width, minimal horizontal */}
      <div className="border border-border/70 rounded-3xl overflow-hidden bg-surface divide-y divide-border/60">
        {members.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No members recorded for this household.</div>
        )}
        {members.map((hm: any) => {
          const p = hm.person || hm;
          const isHead = hm.relationship_to_head === 'SELF';

          return (
            <div
              key={hm.id}
              className={`${isHead ? 'bg-amber-50/40' : 'hover:bg-surface-hover'} cursor-pointer transition-colors group px-5 py-4 flex items-center gap-4`}
              onClick={() => openPerson(hm)}
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-400 text-sm font-serif border border-border/60 flex-shrink-0 overflow-hidden ring-1 ring-inset ring-white/50 group-hover:ring-accent/30 transition-all shadow-sm">
                {p?.avatar_url ? (
                  <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} />
                ) : (
                  <Image src="/images/hero-tree.png" alt="Family symbol" width={44} height={44} className="w-full h-full object-cover opacity-70 grayscale" />
                )}
              </div>

              {/* Name + Relation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-[15px] tracking-[-0.1px] ${isHead ? 'text-amber-800' : 'text-foreground'}`}>
                    {p?.full_name || '—'}
                  </span>
                  {p?.is_deceased && <span className="text-xs text-muted">†</span>}
                  <span className={`inline-block rounded px-2 py-px text-[10px] tracking-widest font-bold uppercase border ${isHead ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-surface-hover text-muted border-border/60'}`}>
                    {hm.relationship_to_head}
                  </span>
                </div>

                {/* Compact meta row - vertical friendly */}
                <div className="mt-1 text-xs text-muted flex flex-wrap gap-x-3 gap-y-0.5 font-medium">
                  {p?.date_of_birth && <span>DOB {p.date_of_birth}</span>}
                  {p?.education && <span>{p.education}</span>}
                  {p?.marital_status && <span>{p.marital_status}</span>}
                  {isApproved && p?.occupation && <span className="text-foreground/70">{p.occupation}</span>}
                </div>
              </div>

              {/* Subtle affordance */}
              <div className="text-[11px] text-primary/60 font-medium hidden sm:block group-hover:text-primary transition-colors">
                Details →
              </div>
            </div>
          );
        })}
      </div>

      {/* Person Detail Modal - unchanged, provides full details + per-person contact */}
      <PersonDetailModal
        isOpen={!!selectedPerson}
        onClose={closeModal}
        person={selectedPerson}
        relationship={selectedRel}
        isApproved={isApproved}
      />
    </>
  );
}

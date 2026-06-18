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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="text-xs font-semibold uppercase tracking-[1.5px] text-foreground flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {isApproved ? `Family Members (${members.length})` : 'Primary Member'}
        </div>
        {isApproved && (
          <Link href={`/submit/correction?household=${householdId}`} className="text-xs text-primary hover:text-accent underline underline-offset-2 ml-auto">
            Suggest correction
          </Link>
        )}
        {canEdit && (
          <div className="flex items-center gap-2 text-xs">
            <Link 
              href={`/households/${householdId}/edit`} 
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 hover:bg-primary/10 px-3 py-1 font-semibold text-primary border border-primary/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              {isAdmin ? 'Edit (Admin)' : 'Edit'}
            </Link>
            <Link 
              href={`/households/${householdId}/edit`} 
              className="text-primary hover:underline font-medium"
              title="Add within this household from the edit page"
            >
              + Add member
            </Link>
          </div>
        )}
      </div>

      {/* Enhanced Table with larger avatars and clickable rows */}
      <div className="bg-surface card overflow-hidden border border-border/60">
        <div className="overflow-x-auto">
          <table className="table text-sm w-full">
            <thead>
              <tr className="bg-primary text-white">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Rel.</th>
                <th className="py-3 px-4">DOB</th>
                {isApproved && <th className="py-3 px-4">Occupation</th>}
                <th className="py-3 px-4">Edu / Marital</th>
                {isApproved && <th className="py-3 px-4">Blood / Notes</th>}
                {isApproved && <th className="py-3 px-4">Contact</th>}
                {isApproved && <th className="py-3 px-4">Links</th>}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr><td colSpan={isApproved ? 8 : 4} className="p-6 text-center text-sm text-muted italic">No members recorded.</td></tr>
              )}
              {members.map((hm: any) => {
                const p = hm.person || hm;
                let familyLinks = '';
                if (isApproved && relationships.length > 0) {
                  const myRels = relationships.filter((r: any) => r.person_id === p.id || r.related_person_id === p.id);
                  familyLinks = myRels.slice(0, 2).map((r: any) => {
                    const otherId = r.person_id === p.id ? r.related_person_id : r.person_id;
                    const otherMember = members.find((m: any) => (m.person?.id || m.person_id) === otherId);
                    const otherName = otherMember ? (otherMember.person?.full_name || 'Family member') : 'Family member';
                    return `${r.relationship_type} of ${otherName}`;
                  }).join('; ');
                  if (myRels.length > 2) familyLinks += '...';
                }
                const isHead = hm.relationship_to_head === 'SELF';

                return (
                  <tr 
                    key={hm.id} 
                    className={`${isHead ? 'bg-accent/10' : 'hover:bg-surface-hover/70 hover:shadow-sm'} cursor-pointer transition-all group border-b border-border/30 last:border-0`}
                    onClick={() => openPerson(hm)}
                  >
                    <td className={`font-medium py-3.5 px-4 ${isHead ? 'text-primary' : 'text-foreground'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-muted text-sm font-serif border-2 border-border flex-shrink-0 overflow-hidden ring-1 ring-inset ring-white/50 group-hover:ring-accent/30 transition-all">
                          {p?.avatar_url ? (
                            <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} />
                          ) : (
                            <Image src="/images/hero-tree.png" alt="Family symbol" width={40} height={40} className="w-full h-full object-cover opacity-75" />
                          )}
                        </div>
                        <div className="truncate font-medium">
                          {p?.full_name || '—'}
                          {p?.is_deceased && <span className="ml-1 text-muted">†</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] tracking-wide ${isHead ? 'bg-primary text-white font-medium' : 'bg-surface text-muted border border-border/50'}`}>
                        {hm.relationship_to_head}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted">{p?.date_of_birth || '—'}</td>
                    {isApproved && <td className="py-3.5 px-4 text-xs text-muted">{p?.occupation || '—'}</td>}
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {p?.education || '—'}<br />
                      <span className="text-muted">{p?.marital_status || ''}</span>
                    </td>
                    {isApproved && (
                      <td className="py-3.5 px-4 text-xs text-muted">
                        {p?.blood_group || '—'}<br />
                        <span className="text-muted text-[10px]">{p?.notes ? p.notes.substring(0, 24) + (p.notes.length > 24 ? '...' : '') : ''}</span>
                      </td>
                    )}
                    {isApproved && (
                      <td className="py-3.5 px-4 text-xs" onClick={e => e.stopPropagation()}>
                        <PrivacyField value={p?.mobile_number} isApproved={isApproved} />
                      </td>
                    )}
                    {isApproved && (
                      <td className="py-3.5 px-4 text-xs max-w-[150px] text-muted truncate" onClick={e => e.stopPropagation()}>{familyLinks || '—'}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Person Detail Modal */}
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

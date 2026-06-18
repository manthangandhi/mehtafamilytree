'use client';

import React from 'react';
import { PrivacyField } from '@/components/ui/PrivacyField';
import Image from 'next/image';

interface PersonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: any;
  relationship: string;
  isApproved: boolean;
}

export function PersonDetailModal({ isOpen, onClose, person, relationship, isApproved }: PersonDetailModalProps) {
  if (!isOpen || !person) return null;

  const p = person;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Minimal blur backdrop - very light, only left area, starts below header */}
      <div 
        className="absolute left-0 top-[64px] right-[40%] bottom-0 bg-black/5"
        onClick={onClose}
      />

      {/* Side panel: full height, exactly 40% from right, covers below header, minimal blur */}
      <div 
        className="fixed right-0 top-[64px] w-[40%] h-[calc(100vh-64px)] bg-surface border-l border-border/70 shadow-2xl overflow-y-auto flex flex-col transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/95 sticky top-0 z-10">
          <div className="text-xs uppercase tracking-[2px] text-muted font-medium">Person Details</div>
          <button 
            onClick={onClose}
            className="text-muted hover:text-foreground text-3xl leading-none -mt-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Large Avatar + Name - bigger picture */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center border-b border-border/40">
          <div className="relative">
            <div className="h-48 w-48 rounded-full overflow-hidden border-[7px] border-accent/30 shadow-2xl bg-surface-hover ring-1 ring-inset ring-white/60">
              {p?.avatar_url ? (
                <img 
                  src={p.avatar_url} 
                  alt={p.full_name} 
                  className="h-full w-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} 
                />
              ) : (
                <Image 
                  src="/images/hero-tree.png" 
                  alt="Family symbol" 
                  width={192} 
                  height={192} 
                  className="h-full w-full object-cover opacity-80" 
                />
              )}
            </div>
            {p?.is_deceased && (
              <div className="absolute -bottom-1 -right-1 bg-surface border-2 border-border rounded-full px-3 py-1 text-xs font-medium text-muted">† Deceased</div>
            )}
          </div>

          <h2 className="mt-4 text-3xl font-serif font-semibold tracking-tight text-foreground">
            {p?.full_name || 'Unknown'}
          </h2>
          
          <div className="mt-2">
            <span className={`inline-block rounded-full px-5 py-1 text-xs font-medium tracking-wider border ${relationship === 'SELF' ? 'bg-primary text-white border-primary' : 'bg-surface-hover text-muted border-border/70'}`}>
              {relationship}
            </span>
          </div>
        </div>

        {/* Content area - stacked nicely for the 40% side panel */}
        <div className="px-6 py-6 flex-1 overflow-y-auto space-y-6 text-sm">
          {/* Quick facts - single column for side panel */}
          <div className="space-y-4">
            {p?.gender && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Gender</div>
                <div className="font-medium text-foreground capitalize">{p.gender}</div>
              </div>
            )}
            {p?.date_of_birth && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Date of Birth</div>
                <div className="font-medium text-foreground">{p.date_of_birth}</div>
              </div>
            )}
            {p?.date_of_death && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Date of Death</div>
                <div className="font-medium text-foreground">{p.date_of_death}</div>
              </div>
            )}
            {p?.marital_status && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Marital Status</div>
                <div className="font-medium text-foreground">{p.marital_status}</div>
              </div>
            )}
            {p?.occupation && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Occupation</div>
                <div className="font-medium text-foreground">{p.occupation}</div>
              </div>
            )}
            {p?.education && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Education</div>
                <div className="font-medium text-foreground">{p.education}</div>
              </div>
            )}
            {p?.blood_group && (
              <div className="flex justify-between border-b border-border/40 pb-2">
                <div className="text-[10px] uppercase tracking-widest text-muted/70">Blood Group</div>
                <div className="font-medium text-foreground">{p.blood_group}</div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          {isApproved && (p?.mobile_number || p?.whatsapp_number || p?.email) && (
            <div>
              <div className="text-[10px] uppercase tracking-[1.5px] text-muted font-medium mb-3">Contact Details</div>
              <div className="space-y-2.5 text-sm bg-surface-hover/40 rounded-xl p-4 border border-border/40">
                {p?.mobile_number && (
                  <div className="flex justify-between">
                    <span className="text-muted">Mobile</span>
                    <span className="font-medium"><PrivacyField value={p.mobile_number} isApproved={isApproved} /></span>
                  </div>
                )}
                {p?.whatsapp_number && (
                  <div className="flex justify-between">
                    <span className="text-muted">WhatsApp</span>
                    <span className="font-medium"><PrivacyField value={p.whatsapp_number} isApproved={isApproved} /></span>
                  </div>
                )}
                {p?.email && (
                  <div className="flex justify-between">
                    <span className="text-muted">Email</span>
                    <span className="font-medium"><PrivacyField value={p.email} isApproved={isApproved} /></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {p?.notes && (
            <div>
              <div className="text-[10px] uppercase tracking-[1.5px] text-muted font-medium mb-2">Notes</div>
              <p className="text-sm text-muted leading-relaxed bg-surface-hover/40 rounded-xl p-4 border border-border/40">
                {p.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border/50 bg-surface mt-auto sticky bottom-0">
          <button 
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium rounded-full border border-border hover:bg-surface-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

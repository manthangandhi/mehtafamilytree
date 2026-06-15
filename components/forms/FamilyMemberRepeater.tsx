'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { relationshipToHeadSchema } from '@/lib/validations/shared';
import type { FamilyMemberRow } from '@/lib/validations/household';

interface Props {
  members: FamilyMemberRow[];
  onChange: (members: FamilyMemberRow[]) => void;
  allowSelf?: boolean; // usually true only for admin creation
}

const relOptions = [
  { value: 'SELF', label: 'SELF (Head)' },
  { value: 'WIFE', label: 'WIFE' },
  { value: 'HUSBAND', label: 'HUSBAND' },
  { value: 'SON', label: 'SON' },
  { value: 'DAUGHTER', label: 'DAUGHTER' },
  { value: 'DAUGHTER IN LAW', label: 'DAUGHTER IN LAW' },
  { value: 'SON IN LAW', label: 'SON IN LAW' },
  { value: 'FATHER', label: 'FATHER' },
  { value: 'MOTHER', label: 'MOTHER' },
  { value: 'GRAND SON', label: 'GRAND SON' },
  { value: 'GRAND DAUGHTER', label: 'GRAND DAUGHTER' },
  { value: 'BROTHER', label: 'BROTHER' },
  { value: 'SISTER', label: 'SISTER' },
  { value: 'OTHER', label: 'OTHER' },
];

const defaultMember: FamilyMemberRow = {
  full_name: '',
  relationship_to_head: 'SON',
  gender: undefined,
  date_of_birth: '',
  is_deceased: false,
  education: '',
  occupation: '',
  marital_status: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  notes: '',
  visibility_level: 'members' as const,
};

export function FamilyMemberRepeater({ members, onChange, allowSelf = true }: Props) {
  const addMember = () => {
    onChange([...members, { ...defaultMember }]);
  };

  const updateMember = (index: number, field: keyof FamilyMemberRow, value: any) => {
    const next = [...members];
    // @ts-expect-error dynamic
    next[index][field] = value;
    onChange(next);
  };

  const removeMember = (index: number) => {
    if (members[index]?.relationship_to_head === 'SELF' && !allowSelf) return;
    onChange(members.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-700">Family Members</div>
        <Button type="button" variant="secondary" size="sm" onClick={addMember}>
          + Add Family Member
        </Button>
      </div>

      <div className="space-y-4">
        {members.length === 0 && (
          <div className="rounded border border-dashed p-4 text-sm text-muted">
            No members added yet. Add the primary head (SELF) first.
          </div>
        )}

        {members.map((m, idx) => {
          const isSelf = m.relationship_to_head === 'SELF';
          return (
            <div key={idx} className="repeater-row">
              <div className="md:col-span-2 lg:col-span-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted">Member #{idx + 1} {isSelf && '(PRIMARY HEAD)'}</span>
                  {(!isSelf || allowSelf) && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <Input
                label="Full Name *"
                value={m.full_name}
                onChange={(e) => updateMember(idx, 'full_name', e.target.value)}
                required
              />

              <Select
                label="Relationship to Head *"
                value={m.relationship_to_head}
                onChange={(e) => updateMember(idx, 'relationship_to_head', e.target.value as any)}
                options={relOptions.filter(o => allowSelf || o.value !== 'SELF')}
              />

              <Select
                label="Gender"
                value={m.gender || ''}
                onChange={(e) => updateMember(idx, 'gender', e.target.value || undefined)}
                options={[
                  { value: '', label: '—' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={m.date_of_birth || ''}
                onChange={(e) => updateMember(idx, 'date_of_birth', e.target.value)}
              />

              <Input
                label="Education"
                value={m.education || ''}
                onChange={(e) => updateMember(idx, 'education', e.target.value)}
              />

              <Input
                label="Occupation"
                value={m.occupation || ''}
                onChange={(e) => updateMember(idx, 'occupation', e.target.value)}
              />

              <Input
                label="Marital Status"
                value={m.marital_status || ''}
                onChange={(e) => updateMember(idx, 'marital_status', e.target.value)}
              />

              <Input
                label="Mobile"
                value={m.mobile_number || ''}
                onChange={(e) => updateMember(idx, 'mobile_number', e.target.value)}
                placeholder="+91 ..."
              />

              <Input
                label="WhatsApp"
                value={m.whatsapp_number || ''}
                onChange={(e) => updateMember(idx, 'whatsapp_number', e.target.value)}
              />

              <Input
                label="Email"
                type="email"
                value={m.email || ''}
                onChange={(e) => updateMember(idx, 'email', e.target.value)}
              />

              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!m.is_deceased}
                    onChange={(e) => updateMember(idx, 'is_deceased', e.target.checked)}
                  />
                  Deceased
                </label>
                {m.is_deceased && (
                  <Input
                    label="Date of Death"
                    type="date"
                    value={m.date_of_death || ''}
                    onChange={(e) => updateMember(idx, 'date_of_death', e.target.value)}
                    className="flex-1"
                  />
                )}
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Input
                  label="Notes"
                  value={m.notes || ''}
                  onChange={(e) => updateMember(idx, 'notes', e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">* Required fields. All changes submitted by members go through admin approval.</p>
    </div>
  );
}

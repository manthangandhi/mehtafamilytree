'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FamilyMemberRepeater } from './FamilyMemberRepeater';
import type { HouseholdFormData, FamilyMemberRow } from '@/lib/validations/household';

interface Props {
  household: HouseholdFormData;
  members: FamilyMemberRow[];
  onHouseholdChange: (h: HouseholdFormData) => void;
  onMembersChange: (m: FamilyMemberRow[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  mode?: 'admin' | 'member-request';
}

export function HouseholdForm({
  household,
  members,
  onHouseholdChange,
  onMembersChange,
  onSubmit,
  submitLabel = 'Save Household',
  isSubmitting,
  mode = 'admin',
}: Props) {
  const updateH = (field: keyof HouseholdFormData, value: any) => {
    onHouseholdChange({ ...household, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <h3 className="section-title mb-1">Household Details</h3>
        <p className="text-xs text-muted mb-4">Enter the primary household information. Contact fields are private to approved members.</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          <Input
            label="Primary Member Name (Head) *"
            value={household.primary_member_name}
            onChange={(e) => updateH('primary_member_name', e.target.value)}
            required
          />
          <Input
            label="Household Code (optional)"
            value={household.household_code || ''}
            onChange={(e) => updateH('household_code', e.target.value)}
            placeholder="HH-DEL-001"
          />
          <Input
            label="Native Place"
            value={household.native_place || ''}
            onChange={(e) => updateH('native_place', e.target.value)}
          />
          <Input label="City" value={household.city || ''} onChange={(e) => updateH('city', e.target.value)} />
          <Input label="State" value={household.state || ''} onChange={(e) => updateH('state', e.target.value)} />
          <Input label="Country" value={household.country || 'India'} onChange={(e) => updateH('country', e.target.value)} />

          <Input label="Phone (Landline)" value={household.phone_number || ''} onChange={(e) => updateH('phone_number', e.target.value)} />
          <Input label="Mobile" value={household.mobile_number || ''} onChange={(e) => updateH('mobile_number', e.target.value)} />
          <Input label="WhatsApp" value={household.whatsapp_number || ''} onChange={(e) => updateH('whatsapp_number', e.target.value)} />
          <Input label="Email" type="email" value={household.email || ''} onChange={(e) => updateH('email', e.target.value)} />

          <div className="md:col-span-2">
            <Textarea label="Residence Address" value={household.residence_address || ''} onChange={(e) => updateH('residence_address', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Business Address" value={household.business_address || ''} onChange={(e) => updateH('business_address', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Notes (private)" value={household.notes || ''} onChange={(e) => updateH('notes', e.target.value)} />
          </div>

          <div>
            <label className="label">Verified</label>
            <input
              type="checkbox"
              checked={household.verified}
              onChange={(e) => updateH('verified', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Mark as verified family record</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title mb-1">Family Members</h3>
        <p className="mb-3 text-xs text-muted">
          Start with the head (“SELF”). Add spouse, children, and other relatives. Relationship to head determines basic person-to-person links.
        </p>
        <FamilyMemberRepeater
          members={members}
          onChange={onMembersChange}
          allowSelf={mode === 'admin'}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
      {mode === 'member-request' && (
        <p className="text-center text-xs text-primary">
          This will be submitted as a pending request for admin review. It will not appear in the family record until approved.
        </p>
      )}
    </form>
  );
}

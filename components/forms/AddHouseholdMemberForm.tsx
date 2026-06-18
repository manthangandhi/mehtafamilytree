'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMemberRepeater } from '@/components/forms/FamilyMemberRepeater';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { FamilyMemberRow } from '@/lib/validations/household';

interface Props {
  householdId: string;
  householdName: string;
  onSubmitAction: (member: any) => Promise<{ success: boolean; error?: string }>;
}

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
  avatar_url: '',
  visibility_level: 'members' as const,
};

export function AddHouseholdMemberForm({ householdId, householdName, onSubmitAction }: Props) {
  const [members, setMembers] = useState<FamilyMemberRow[]>([{ ...defaultMember }]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const valid = members.filter(m => m.full_name && m.full_name.trim().length > 0);
    if (valid.length === 0) {
      toast.error('Please enter at least a full name');
      return;
    }

    setSubmitting(true);
    const member = valid[0]; // single add for this flow

    const result = await onSubmitAction({
      household_id: householdId,
      member: {
        full_name: member.full_name,
        relationship_to_head: member.relationship_to_head,
        gender: member.gender || null,
        date_of_birth: member.date_of_birth || null,
        occupation: member.occupation || null,
        education: member.education || null,
        marital_status: member.marital_status || null,
        mobile_number: member.mobile_number || null,
        notes: member.notes || null,
        avatar_url: member.avatar_url || null,
      },
    });

    if (result.success) {
      toast.success('New member submitted for admin review');
      setMembers([{ ...defaultMember }]);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to submit');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <FamilyMemberRepeater
        members={members}
        onChange={setMembers}
        allowSelf={false}
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit New Member for Review'}
        </Button>
        <p className="text-[11px] text-muted self-center">Avatar supported. Will be added to {householdName} after review.</p>
      </div>
    </div>
  );
}

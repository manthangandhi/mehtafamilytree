'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMemberRepeater } from '@/components/forms/FamilyMemberRepeater';
import { addMembersToHouseholdAction } from '@/lib/actions/households';
import type { FamilyMemberRow } from '@/lib/validations/household';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface Props {
  householdId: string;
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
  visibility_level: 'members' as const,
};

export function AddMembersForm({ householdId }: Props) {
  const [members, setMembers] = useState<FamilyMemberRow[]>([{ ...defaultMember }]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    // Filter out empty rows
    const validMembers = members.filter(m => m.full_name.trim().length > 0);
    if (validMembers.length === 0) {
      toast.error('Please add at least one family member with a name');
      return;
    }

    setSubmitting(true);

    const result = await addMembersToHouseholdAction(householdId, validMembers);

    if (result.success) {
      toast.success('Additional family members added successfully!');
      setMembers([{ ...defaultMember }]);
      router.refresh(); // Refresh to show updated members if any list
    } else {
      toast.error(result.error || 'Failed to add members');
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

      <div className="flex justify-end">
        <Button 
          onClick={handleAdd} 
          variant="primary" 
          disabled={submitting}
        >
          {submitting ? 'Adding Members...' : 'Add These Family Members'}
        </Button>
      </div>

      <p className="text-xs text-muted">
        Added members will be linked with the appropriate relationships to the household head where applicable.
      </p>
    </div>
  );
}

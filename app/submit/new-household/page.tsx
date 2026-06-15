'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HouseholdForm } from '@/components/forms/HouseholdForm';
import { submitNewHouseholdRequestAction } from '@/lib/actions/households';
import type { HouseholdFormData, FamilyMemberRow } from '@/lib/validations/household';
import { toast } from 'sonner';

const emptyHousehold: HouseholdFormData = {
  primary_member_name: '',
  household_code: '',
  native_place: '',
  residence_address: '',
  business_address: '',
  phone_number: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  city: '',
  state: '',
  country: 'India',
  notes: '',
  verified: false,
  visibility_level: 'members',
  status: 'active',
};

export default function SubmitNewHouseholdPage() {
  const [household, setHousehold] = useState<HouseholdFormData>(emptyHousehold);
  const [members, setMembers] = useState<FamilyMemberRow[]>([
    { 
      full_name: '', 
      relationship_to_head: 'SELF', 
      gender: undefined, 
      date_of_birth: '', 
      is_deceased: false,
      visibility_level: 'members' as const,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await submitNewHouseholdRequestAction({ household, members });

    if (result.success) {
      toast.success('Request submitted successfully. An admin will review it.');
      router.push('/my-requests');
    } else {
      toast.error(result.error || 'Failed to submit request');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl">Submit New Household</h1>
        <p className="text-muted mt-2">Your submission will be reviewed by an administrator before it appears in the family record.</p>
      </div>

      <div className="mt-6">
        <HouseholdForm
          household={household}
          members={members}
          onHouseholdChange={setHousehold}
          onMembersChange={setMembers}
          onSubmit={handleSubmit}
          submitLabel="Submit for Approval"
          isSubmitting={submitting}
          mode="member-request"
        />
      </div>
    </div>
  );
}

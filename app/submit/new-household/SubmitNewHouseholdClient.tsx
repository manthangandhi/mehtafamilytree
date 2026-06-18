'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HouseholdForm } from '@/components/forms/HouseholdForm';
import { createMyHouseholdAction } from '@/lib/actions/households';
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

export default function SubmitNewHouseholdClient() {
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

    const result = await createMyHouseholdAction({ household, members });

    if (result.success) {
      toast.success('Household created successfully. It is now live.');
      router.push(result.householdId ? `/households/${result.householdId}` : '/dashboard');
    } else {
      toast.error(result.error || 'Failed to create household');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl">Add Your Household</h1>
        <p className="text-muted mt-2">Create and manage your own household record. Include the primary head as SELF. Changes are live immediately. You can only manage your own household.</p>
      </div>

      <div className="mt-6">
        <HouseholdForm
          household={household}
          members={members}
          onHouseholdChange={setHousehold}
          onMembersChange={setMembers}
          onSubmit={handleSubmit}
          submitLabel="Create My Household"
          isSubmitting={submitting}
          mode="member-request"
        />
      </div>
    </div>
  );
}

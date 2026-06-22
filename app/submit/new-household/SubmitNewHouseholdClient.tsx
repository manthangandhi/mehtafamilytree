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

import { PageHeader } from '@/components/ui/PageHeader';

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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader 
        title="Add Your Household"
        description="Create and manage your own household record. Include the primary head as SELF. Changes are live immediately. You can only manage your own household."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        }
      />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-10">
        <div className="premium-card p-8 md:p-10 max-w-4xl mx-auto">
          <HouseholdForm
            household={household}
            members={members}
            onHouseholdChange={setHousehold}
            onMembersChange={setMembers}
            onSubmit={handleSubmit}
            submitLabel="Create My Household"
            isSubmitting={submitting}
            mode="member-request"
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HouseholdForm } from '@/components/forms/HouseholdForm';
import type { HouseholdFormData, FamilyMemberRow } from '@/lib/validations/household';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';
import { updateMyHouseholdAction, addMembersToMyHouseholdAction, updateMyPersonAction } from '@/lib/actions/households';

interface Props {
  householdId: string;
  initialHousehold: HouseholdFormData;
  initialMembers: FamilyMemberRow[];
}

export default function EditHouseholdClient({ householdId, initialHousehold, initialMembers }: Props) {
  const [household, setHousehold] = useState<HouseholdFormData>(initialHousehold);
  // Ensure we always have at least one empty member if the array is somehow empty
  const [members, setMembers] = useState<FamilyMemberRow[]>(initialMembers.length > 0 ? initialMembers : [
    { 
      full_name: '', 
      relationship_to_head: 'SELF', 
      gender: undefined, 
      date_of_birth: '', 
      is_deceased: false,
      visibility_level: 'members' as const,
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Update household details
      const hRes = await updateMyHouseholdAction(householdId, household);
      if (hRes && !hRes.success) throw new Error(hRes.error || 'Failed to update household details');

      // 2. Update existing members and find new members
      const newMembers: FamilyMemberRow[] = [];
      for (const m of members) {
        if (m.id) {
          // Existing member
          const pRes = await updateMyPersonAction(m.id, m);
          if (pRes && !pRes.success) throw new Error(pRes.error || `Failed to update member: ${m.full_name}`);
        } else {
          // New member
          newMembers.push(m);
        }
      }

      // 3. Add new members if any
      if (newMembers.length > 0) {
        const addRes = await addMembersToMyHouseholdAction(householdId, newMembers);
        if (addRes && !addRes.success) throw new Error(addRes.error || 'Failed to add new members');
      }

      toast.success('Household updated successfully!');
      router.push(`/households/${householdId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while updating the household.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader 
        title="Edit Household"
        description="Update your household details and family members. Changes are live immediately. Use the wizard below to manage information smoothly."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
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
            submitLabel="Save Changes"
            isSubmitting={submitting}
            mode="member-request"
            onCancel={() => router.push(`/households/${householdId}`)}
          />
        </div>
      </div>
    </div>
  );
}

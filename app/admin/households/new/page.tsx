'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HouseholdForm } from '@/components/forms/HouseholdForm';
import { createHouseholdAction } from '@/lib/actions/households';
import type { HouseholdFormData, FamilyMemberRow } from '@/lib/validations/household';
import { toast } from 'sonner';

const emptyH: HouseholdFormData = {
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
  verified: true,
  visibility_level: 'members',
  status: 'active',
};

export default function AdminNewHousehold() {
  const [household, setHousehold] = useState<HouseholdFormData>(emptyH);
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createHouseholdAction({ household, members });
    if (res.success) {
      toast.success('Household created successfully');
      router.push(`/admin/households/${res.householdId}`);
    } else {
      toast.error(res.error || 'Failed to create');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/admin/households" className="text-sm">← All Households</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create Household (Admin)</h1>
      <p className="text-sm text-muted">This creates live data immediately and logs an audit entry.</p>

      <div className="mt-6">
        <HouseholdForm
          household={household}
          members={members}
          onHouseholdChange={setHousehold}
          onMembersChange={setMembers}
          onSubmit={onSubmit}
          submitLabel={loading ? 'Creating...' : 'Create Household'}
          isSubmitting={loading}
          mode="admin"
        />
      </div>
    </div>
  );
}

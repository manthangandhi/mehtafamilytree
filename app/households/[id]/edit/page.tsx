import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { getHouseholdMembers } from '@/lib/actions/persons';
import EditHouseholdClient from './EditHouseholdClient';

export default async function HouseholdEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserProfile();

  if (!current || !current.profile || current.profile.status !== 'approved') {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: householdData } = await supabase
    .from('member_households_view')
    .select('*')
    .eq('id', id)
    .single();

  const household = householdData as any;

  if (!household) notFound();

  // Ownership OR admin override guard
  const { data: fullH } = await (supabase.from('households') as any)
    .select('created_by, owner_profile_id')
    .eq('id', id)
    .single();
  const isOwner = fullH && (fullH.created_by === current.id || fullH.owner_profile_id === current.id);
  const isAdmin = current.profile.role === 'admin';
  if (!isOwner && !isAdmin) {
    // Non-owners (non-admins) cannot edit other households
    redirect(`/households/${id}`);
  }

  const membersRaw = await getHouseholdMembers(id);
  const initialMembers = membersRaw.map((m: any) => {
    const p = m.person || m;
    return {
      id: p.id,
      full_name: p.full_name || '',
      relationship_to_head: m.relationship_to_head || 'OTHER',
      gender: p.gender || undefined,
      date_of_birth: p.date_of_birth || '',
      is_deceased: p.is_deceased || false,
      education: p.education || '',
      occupation: p.occupation || '',
      marital_status: p.marital_status || '',
      mobile_number: p.mobile_number || '',
      whatsapp_number: p.whatsapp_number || '',
      email: p.email || '',
      notes: p.notes || '',
      avatar_url: p.avatar_url || '',
      visibility_level: p.visibility_level || 'members',
    };
  });

  const initialHousehold = {
    primary_member_name: household.primary_member_name || '',
    household_code: household.household_code || '',
    native_place: household.native_place || '',
    residence_address: household.residence_address || '',
    business_address: household.business_address || '',
    phone_number: household.phone_number || '',
    mobile_number: household.mobile_number || '',
    whatsapp_number: household.whatsapp_number || '',
    email: household.email || '',
    city: household.city || '',
    state: household.state || '',
    country: household.country || 'India',
    notes: household.notes || '',
    verified: household.verified || false,
    visibility_level: household.visibility_level || 'members',
    status: household.status || 'active',
  };

  return (
    <EditHouseholdClient 
      householdId={id} 
      initialHousehold={initialHousehold} 
      initialMembers={initialMembers} 
    />
  );
}

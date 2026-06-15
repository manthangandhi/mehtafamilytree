import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { createClient } from '@/lib/supabase/server';
import FamilyTreeClient from './FamilyTreeClient';

export default async function FamilyTreePage() {
  const current = await getCurrentUserProfile();

  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/dashboard?status=pending');
  }

  const supabase = await createClient();

  const [{ data: households }, { data: householdMembers }, { data: relationships }] = await Promise.all([
    supabase.from('member_households_view').select('*').eq('status', 'active').order('primary_member_name'),
    supabase.from('household_members').select('*, person:persons(id, full_name, date_of_birth, is_deceased)').order('display_order'),
    supabase.from('relationships').select('*'),
  ]);

  // Build the tree data server-side (same logic as before)
  const treeData = (households || []).map((h: any) => {
    const members = (householdMembers || [])
      .filter((hm: any) => hm.household_id === h.id)
      .sort((a: any, b: any) => a.display_order - b.display_order);

    const personIds = members.map((m: any) => m.person_id);
    const rels = (relationships || []).filter((r: any) => 
      personIds.includes(r.person_id) || personIds.includes(r.related_person_id)
    );

    return {
      ...h,
      members,
      relationships: rels,
    };
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">


        <FamilyTreeClient treeData={treeData} />

        <div className="mt-10 text-center text-xs text-muted">
          Tree derived from household_members + relationships tables. 
          For complex multi-generational views, additional relationship data helps.
        </div>
      </div>
    </div>
  );
}

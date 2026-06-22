import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { createClient } from '@/lib/supabase/server';
import FamilyTreeClient from './FamilyTreeClient';

import { FloralBackground } from '@/components/ui/FloralBackground';

export default async function FamilyTreePage() {
  const current = await getCurrentUserProfile();

  if (!current?.profile || current.profile.status !== 'approved') {
    redirect('/dashboard?status=pending');
  }

  const supabase = await createClient();

  const [{ data: households }, { data: householdMembers }, { data: relationships }, { data: allPersons }] = await Promise.all([
    supabase.from('member_households_view').select('*').eq('status', 'active').order('primary_member_name'),
    supabase.from('household_members').select('*, person:persons(*)').order('display_order'),
    supabase.from('relationships').select('*'),
    supabase.from('persons').select('id, full_name, gender, father_id, mother_id, spouse_id, date_of_birth'),
  ]);

  // Build the tree data server-side
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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      {/* Primary Brand Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
        <FloralBackground opacity="0.10" />
        
        <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
              </div>
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                  Family Tree Visualizer
                </h1>
                <p className="text-[16px] text-white/90 font-medium drop-shadow-sm max-w-xl">
                  Interactive visualization of the Mehta Kutumb lineages and connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] w-full flex-grow px-6 py-10">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 mb-12">
          <FamilyTreeClient treeData={treeData} allPersons={allPersons || []} allRelationships={relationships || []} />
        </div>
        <div className="mt-6 text-center text-xs text-gray-500 font-medium">
          Tree derived from household records and relationships. 
        </div>
      </div>
    </div>
  );
}

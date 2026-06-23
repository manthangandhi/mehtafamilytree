import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { createClient } from '@/lib/supabase/server';
import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { HouseholdCard } from '@/components/directory/HouseholdCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { TranslatedDirectoryHeader } from './TranslatedDirectoryHeader';

interface SearchParams {
  q?: string;
  city?: string;
  state?: string;
  native_place?: string;
  relationship?: string;
  marital_status?: string;
  is_deceased?: string;
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const current = await getCurrentUserProfile();
  const isApproved = !!current?.profile && current.profile.status === 'approved';

  const params = await searchParams;
  const supabase = await createClient();

  // 1. First find any qualifying household IDs from person searches
  let personHouseholdIds: string[] = [];
  const hasPersonFilters = !!(params.q || params.marital_status || params.is_deceased || params.relationship);

  if (hasPersonFilters) {
    let memberQuery = supabase
      .from('member_household_members_view')
      .select('household_id');

    if (params.q) memberQuery = memberQuery.ilike('full_name', `%${params.q}%`);
    if (params.marital_status) memberQuery = memberQuery.ilike('marital_status', `%${params.marital_status}%`);
    if (params.is_deceased === 'true') memberQuery = memberQuery.eq('is_deceased', true);
    if (params.is_deceased === 'false') memberQuery = memberQuery.eq('is_deceased', false);
    if (params.relationship) memberQuery = memberQuery.eq('relationship_to_head', params.relationship);

    const { data: memData } = await memberQuery;
    if (memData && memData.length > 0) {
      personHouseholdIds = Array.from(new Set(memData.map((m: any) => m.household_id).filter(Boolean)));
    }
  }

  // 2. Fetch households
  let query = supabase
    .from(isApproved ? 'member_households_view' : 'public_households_view')
    .select('*')
    .eq('status', 'active')
    .order('primary_member_name');

  if (params.q) {
    if (personHouseholdIds.length > 0) {
      query = query.or(`primary_member_name.ilike.%${params.q}%,secondary_member_name.ilike.%${params.q}%,id.in.(${personHouseholdIds.join(',')})`);
    } else {
      query = query.or(`primary_member_name.ilike.%${params.q}%,secondary_member_name.ilike.%${params.q}%`);
    }
  } else if (hasPersonFilters) {
    if (personHouseholdIds.length > 0) {
      query = query.in('id', personHouseholdIds);
    } else {
      query = query.in('id', ['00000000-0000-0000-0000-000000000000']);
    }
  }

  if (params.city) query = query.ilike('city', `%${params.city}%`);
  if (params.state) query = query.ilike('state', `%${params.state}%`);
  if (params.native_place) query = query.ilike('native_place', `%${params.native_place}%`);

  const { data: householdsData } = await query;
  const households: any[] = householdsData || [];
  const totalResults = households.length;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Edge-to-edge Vibrant Header */}
      <TranslatedDirectoryHeader isApproved={isApproved} />

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-10">
        
        {/* Unified Search & Results Container */}
        <div className="premium-card p-8 md:p-10">
          
          <div className="mb-10">
            <DirectorySearch initialFilters={params as any} />
          </div>

          {/* Results count */}
          {(params.q || params.city || params.state || params.native_place || params.marital_status || params.is_deceased || params.relationship) && (
            <div className="mb-6 text-sm font-bold uppercase tracking-wider text-primary/60 animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span>
              Found <span className="text-primary">{totalResults}</span> results
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-6 text-xl font-serif font-bold text-gray-800 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-400 rounded-full"></span>
              Households
            </h2>
            {!households || households.length === 0 ? (
              <EmptyState title="No households found" description="Try broadening your search." />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {households.map((h: any) => (
                  <HouseholdCard key={h.id} household={h} isApproved={isApproved} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 py-6 border-t border-amber-100 mt-auto">
        <p className="text-center text-sm text-amber-800 font-medium px-6">
          <span className="font-bold">Privacy Note:</span> Full addresses, phone numbers, and emails are exclusively visible to approved family members.
        </p>
      </div>
    </div>
  );
}

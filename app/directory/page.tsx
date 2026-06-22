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

  // Household level filters (location based) - always applied
  let locationQuery = supabase
    .from(isApproved ? 'member_households_view' : 'public_households_view')
    .select('*')
    .eq('status', 'active');

  if (params.city) locationQuery = locationQuery.ilike('city', `%${params.city}%`);
  if (params.state) locationQuery = locationQuery.ilike('state', `%${params.state}%`);
  if (params.native_place) locationQuery = locationQuery.ilike('native_place', `%${params.native_place}%`);

  const { data: locData } = await locationQuery.order('primary_member_name');
  const locationHouseholds: any[] = locData || [];

  // Smart search: q matches primary/secondary name OR any person in the household
  // Person filters (marital, deceased, relationship) also match via household members
  const hasTextOrPersonFilter = !!(params.q || params.marital_status || params.is_deceased || params.relationship);
  const qualifyingIds = new Set<string>();

  if (params.q) {
    const qLower = params.q.toLowerCase();
    locationHouseholds.forEach((h: any) => {
      const primary = (h.primary_member_name || '').toLowerCase();
      const secondary = (h.secondary_member_name || '').toLowerCase();
      if (primary.includes(qLower) || secondary.includes(qLower)) {
        qualifyingIds.add(h.id);
      }
    });
  }

  if (isApproved && (params.q || params.marital_status || params.is_deceased || params.relationship)) {
    let memberQuery = supabase
      .from('member_household_members_view')
      .select('household_id');

    if (params.q) {
      memberQuery = memberQuery.ilike('full_name', `%${params.q}%`);
    }
    if (params.marital_status) {
      memberQuery = memberQuery.ilike('marital_status', `%${params.marital_status}%`);
    }
    if (params.is_deceased === 'true') memberQuery = memberQuery.eq('is_deceased', true);
    if (params.is_deceased === 'false') memberQuery = memberQuery.eq('is_deceased', false);
    if (params.relationship) {
      memberQuery = memberQuery.eq('relationship_to_head', params.relationship);
    }

    const { data: memData } = await memberQuery;
    const memberMatches: any[] = memData || [];
    const locationIdSet = new Set(locationHouseholds.map((h: any) => h.id));
    memberMatches.forEach((m: any) => {
      if (m.household_id && locationIdSet.has(m.household_id)) {
        qualifyingIds.add(m.household_id);
      }
    });
  }

  let households: any[] = locationHouseholds;
  if (hasTextOrPersonFilter) {
    households = locationHouseholds.filter((h: any) => qualifyingIds.has(h.id));
  }

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

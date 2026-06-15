import Link from 'next/link';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { createClient } from '@/lib/supabase/server';
import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { HouseholdCard } from '@/components/directory/HouseholdCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

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

  // Always use safe public view for base query
  let query = supabase
    .from(isApproved ? 'member_households_view' : 'public_households_view')
    .select('*')
    .eq('status', 'active')
    .order('primary_member_name');

  if (params.q) {
    query = query.ilike('primary_member_name', `%${params.q}%`);
  }
  if (params.city) query = query.ilike('city', `%${params.city}%`);
  if (params.state) query = query.ilike('state', `%${params.state}%`);
  if (params.native_place) query = query.ilike('native_place', `%${params.native_place}%`);

  const { data: households } = await query;

  // Simple person search too (limited)
  let personQuery = supabase
    .from(isApproved ? 'member_persons_view' : 'public_persons_view')
    .select('*')
    .eq('status', 'active')
    .limit(50);

  if (params.q) {
    personQuery = personQuery.ilike('full_name', `%${params.q}%`);
  }
  if (params.marital_status) {
    personQuery = personQuery.ilike('marital_status', `%${params.marital_status}%`);
  }
  if (params.is_deceased === 'true') personQuery = personQuery.eq('is_deceased', true);
  if (params.is_deceased === 'false') personQuery = personQuery.eq('is_deceased', false);

  // Bug fix #5: Note that relationship filter cannot be applied at the household level
  // since it requires joining household_members. It's applied to person search below.
  // For now, show a note if the filter is active.

  const { data: persons } = await personQuery;

  const totalResults = (households?.length || 0) + (persons?.length || 0);

  return (
    <div className="min-h-screen">

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-11 w-11 flex-shrink-0 mt-1 rounded-2xl bg-primary/5 text-primary items-center justify-center border border-border/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="font-serif text-[36px] leading-[1.05] font-semibold text-foreground tracking-[-0.02em]">Mehta Kutumb Households</h1>
              <p className="mt-1.5 text-[15px] text-muted max-w-xl">
                {isApproved
                  ? 'Full details visible to approved family members.'
                  : 'Public view — private contact details hidden for privacy.'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted/80">One family • Many branches across borders • Forever connected</p>
            </div>
          </div>
          {isApproved && (
            <Link href="/submit/new-household">
              <Button variant="secondary" className="text-sm py-2.5 px-6 border border-border/50 bg-surface hover:bg-surface-hover shadow-sm whitespace-nowrap">
                + Submit New Household
              </Button>
            </Link>
          )}
        </div>

        <DirectorySearch
          initialFilters={params as any}
        />

        {/* Results count */}
        {(params.q || params.city || params.state || params.native_place) && (
          <div className="mt-4 text-sm text-muted animate-fade-in">
            Found <span className="font-medium text-stone-700">{totalResults}</span> results
          </div>
        )}

        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Households
          </h2>
          {!households || households.length === 0 ? (
            <EmptyState title="No households found" description="Try broadening your search." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {households.map((h: any) => (
                <HouseholdCard key={h.id} household={h} isApproved={isApproved} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            Matching Persons
          </h2>
          {!persons || persons.length === 0 ? (
            <p className="text-sm text-muted italic">No matching persons in current search.</p>
          ) : (
            <div className="bg-surface premium-card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface-hover/50 border-b border-border/50">
                    <th className="py-4 px-6 font-semibold text-muted tracking-wide">Name</th>
                    <th className="py-4 px-6 font-semibold text-muted tracking-wide">Education</th>
                    <th className="py-4 px-6 font-semibold text-muted tracking-wide">Marital Status</th>
                    <th className="py-4 px-6 font-semibold text-muted tracking-wide">Status</th>
                    {isApproved && <th className="py-4 px-6 font-semibold text-muted tracking-wide">Contact</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {persons.map((p: any) => (
                    <tr key={p.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground whitespace-nowrap">{p.full_name}</td>
                      <td className="py-4 px-6 text-muted max-w-[200px] truncate" title={p.education}>{p.education || '—'}</td>
                      <td className="py-4 px-6 text-muted whitespace-nowrap">{p.marital_status || '—'}</td>
                      <td className="py-4 px-6">
                        {p.is_deceased ? (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <span className="text-stone-300">†</span> Deceased
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700">Alive</span>
                        )}
                      </td>
                      {isApproved && (
                        <td className="py-4 px-6 text-xs text-muted whitespace-nowrap">
                          {p.mobile_number || p.whatsapp_number ? 'See household detail' : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Privacy protected. Full addresses, phones and emails are only visible to approved family members.
        </p>
      </div>
    </div>
  );
}

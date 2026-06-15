import Link from 'next/link';

interface Props {
  household: any;
  isApproved: boolean;
}

export function HouseholdCard({ household, isApproved }: Props) {
  const location = [household.city, household.state, household.country].filter(Boolean).join(', ') || household.native_place || '—';

  return (
    <Link
      href={`/households/${household.id}`}
      className="group flex flex-col min-h-[152px] p-6 bg-surface rounded-3xl border border-border/70 hover:border-accent/40 hover:shadow-lg transition-all active:scale-[0.985]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary font-serif text-[26px] font-bold border border-border/50 overflow-hidden">
          {household.primary_member_name.charAt(0)}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-serif text-[21px] leading-tight font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {household.primary_member_name}
          </h3>
          {household.secondary_member_name && (
            <p className="font-sans text-[15px] text-muted line-clamp-1 mt-0.5">
              &amp; {household.secondary_member_name}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2.5 py-px rounded-full bg-surface-hover text-foreground text-[11px] font-medium border border-border/70">
              {household.household_type || 'Family'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-5 flex flex-col gap-1.5 border-t border-border/50">
        <div className="text-[13px] text-muted flex items-center gap-1.5 truncate">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-sans text-[13px] text-muted flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {household.member_count || 1} Members
          </div>
          <span className="font-sans text-[11px] font-bold text-primary tracking-[1px] uppercase group-hover:underline">
            VIEW HOUSEHOLD →
          </span>
        </div>
      </div>
    </Link>
  );
}

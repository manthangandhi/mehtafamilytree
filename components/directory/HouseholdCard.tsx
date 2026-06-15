import Link from 'next/link';

interface Props {
  household: any;
  isApproved: boolean;
}

export function HouseholdCard({ household, isApproved }: Props) {
  return (
    <Link
      href={`/households/${household.id}`}
      className="group flex flex-col min-h-[140px] p-6 bg-surface rounded-sm border border-border hover:bg-surface-hover transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm bg-primary-container text-on-primary-container font-serif text-[24px] font-bold">
          {household.primary_member_name.charAt(0)}
        </div>
        <div className="flex-grow">
          <h3 className="font-serif text-[22px] font-semibold text-foreground line-clamp-1">
            {household.primary_member_name}
          </h3>
          {household.secondary_member_name && (
            <p className="font-sans text-[16px] text-muted line-clamp-1 mt-1">
              &amp; {household.secondary_member_name}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm bg-surface-hover text-foreground text-[12px] font-medium border border-border">
              {household.household_type || 'Family'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50">
        <div className="font-sans text-[14px] text-muted flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {household.member_count || 1} Members
        </div>
        <span className="font-sans text-[12px] font-bold text-primary tracking-widest uppercase group-hover:underline">
          VIEW RECORD &rarr;
        </span>
      </div>
    </Link>
  );
}

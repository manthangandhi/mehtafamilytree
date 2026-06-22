import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { PrivacyField } from '@/components/ui/PrivacyField';
import { getHouseholdMembers } from '@/lib/actions/persons';
import { FamilyMembersTable } from '@/components/household/FamilyMembersTable';
import { FloralBackground } from '@/components/ui/FloralBackground';

export default async function HouseholdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserProfile();
  const isApproved = !!current?.profile && current.profile.status === 'approved';

  const supabase = await createClient();

  // Use appropriate view
  const view = isApproved ? 'member_households_view' : 'public_households_view';
  const { data: householdRaw } = await supabase.from(view).select('*').eq('id', id).single();

  if (!householdRaw) {
    notFound();
  }
  const household: any = householdRaw;

  let members: any[] = [];
  let relationships: any[] = [];
  if (isApproved) {
    members = await getHouseholdMembers(id);
    const personIds = members.map((m: any) => m.person?.id || m.person_id).filter(Boolean);
    if (personIds.length > 0) {
      try {
        const { data: rels } = await supabase
          .from('relationships')
          .select('*')
          .in('person_id', personIds)
          .or(`related_person_id.in.(${personIds.join(',')})`);
        relationships = rels || [];
      } catch (e) {
        relationships = [];
      }
    }
  } else if (household.primary_person_id) {
    // For public visitors: show at least the primary/head safely via public view
    const { data: primary } = await supabase
      .from('public_persons_view')
      .select('*')
      .eq('id', household.primary_person_id)
      .single();
    if (primary) {
      members = [{
        id: 'primary',
        relationship_to_head: 'SELF',
        display_order: 1,
        is_primary: true,
        person: primary
      }];
    }
  }

  // canEdit for owners or admin
  let canEdit = false;
  const isAdmin = !!current?.profile && current.profile.role === 'admin';
  if (isApproved) {
    // Use maybeSingle + defensive select so missing owner_profile_id (partial migration) never 500s
    const { data: ownCheck } = await (supabase.from('households') as any)
      .select('created_by, owner_profile_id')
      .eq('id', id)
      .maybeSingle();
    const isOwner = ownCheck && (ownCheck.created_by === current.id || ownCheck.owner_profile_id === current.id);
    canEdit = isOwner || isAdmin;
  }

  const contactFields = [
    { label: 'Residence', value: household.residence_address, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> },
    { label: 'Mobile', value: household.mobile_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg> },
    { label: 'WhatsApp', value: household.whatsapp_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
    { label: 'Email', value: household.email, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
    { label: 'Phone', value: household.phone_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Green edge-to-edge header — exactly matching the directory and other pages */}
      <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
        <FloralBackground opacity="0.10" />
        
        <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
          {/* Small back link for consistency */}
          <div className="-mt-2 mb-3">
            <Link href="/directory" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white font-medium">
              ← Back to Households
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="max-w-xl">
                <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-1 drop-shadow-md">
                  {household.primary_member_name}
                </h1>
                <p className="text-[16px] text-white/90 font-medium drop-shadow-sm">
                  {[household.native_place, household.city, household.state, household.country].filter(Boolean).join(', ') || '—'}
                </p>
                {household.verified && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-white border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    Verified Record
                  </div>
                )}
              </div>
            </div>

            {/* Prominent actions on the right (white buttons like directory submit) */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {isApproved && (
                <Link
                  href={`/submit/correction?household=${id}`}
                  className="text-sm text-white/90 hover:text-white underline underline-offset-2 px-2 py-1 whitespace-nowrap"
                >
                  Suggest correction
                </Link>
              )}
              {canEdit && (
                <Link
                  href={`/households/${id}/edit`}
                  className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 border border-transparent shadow-lg px-5 py-2.5 rounded-full font-bold transition-transform hover:scale-[1.02] active:scale-[0.985] text-sm whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  {isAdmin ? 'Edit (Admin)' : 'Edit'}
                </Link>
              )}
              {canEdit && (
                <Link
                  href={`/households/${id}/edit`}
                  className="text-sm text-white/90 hover:text-white font-medium px-2 py-1 whitespace-nowrap"
                  title="Add a new member to this household"
                >
                  + Add member
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area below green header (matches directory page structure) */}
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-8">

        {/* Contact Details */}
        <div className="premium-card p-8 md:p-10 mb-8">
          <h2 className="mb-6 text-xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span>
            Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {contactFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[1.5px] font-medium text-muted mb-1.5">
                  <span className="text-muted/70">{field.icon}</span>
                  <span>{field.label}</span>
                </div>
                <div className="text-[15px] leading-snug text-foreground font-medium break-words">
                  <PrivacyField value={field.value} isApproved={isApproved} />
                </div>
              </div>
            ))}
          </div>

          {!isApproved && (
            <div className="mt-8 text-sm bg-surface-hover border border-border/60 rounded-2xl p-5 text-muted">
              Full contact details are available to approved family members only.{' '}
              <Link href="/login" className="text-primary underline">Sign in</Link> with an approved account.
            </div>
          )}

          {/* Notes (if any) integrated here for approved users */}
          {household.notes && isApproved && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="text-[10px] uppercase tracking-[1.5px] font-medium text-muted mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                NOTES
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{household.notes}</p>
            </div>
          )}
        </div>

        {/* Family Members - full width, vertical presentation, no horizontal table */}
        <div className="premium-card p-8 md:p-10">
          <div className="mb-5">
            <div className="text-xl font-serif font-bold text-gray-800 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-400 rounded-full"></span>
              {isApproved ? `Family Members (${members.length})` : 'Primary Member'}
            </div>
          </div>

          <FamilyMembersTable
            members={members}
            relationships={relationships}
            isApproved={isApproved}
            isAdmin={isAdmin}
            canEdit={canEdit}
            householdId={id}
          />
        </div>

      </div>

      {/* Consistent privacy footer note like other pages */}
      <div className="bg-amber-50 py-5 border-t border-amber-100 mt-auto">
        <p className="text-center text-sm text-amber-800 font-medium px-6">
          <span className="font-bold">Privacy Note:</span> Full addresses, phone numbers, and emails are exclusively visible to approved family members.
        </p>
      </div>
    </div>
  );
}

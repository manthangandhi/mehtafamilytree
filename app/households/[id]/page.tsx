import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { PrivacyField } from '@/components/ui/PrivacyField';
import { getHouseholdMembers } from '@/lib/actions/persons';

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
      const { data: rels } = await supabase
        .from('relationships')
        .select('*')
        .in('person_id', personIds)
        .or(`related_person_id.in.(${personIds.join(',')})`);
      relationships = rels || [];
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

  const contactFields = [
    { label: 'Residence', value: household.residence_address, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> },
    { label: 'Mobile', value: household.mobile_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg> },
    { label: 'WhatsApp', value: household.whatsapp_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
    { label: 'Email', value: household.email, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
    { label: 'Phone', value: household.phone_number, icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted animate-fade-in">
          <Link href="/directory" className="hover:text-primary transition-colors">Households</Link>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <span className="text-muted font-medium truncate max-w-[200px]">{household.primary_member_name}</span>
        </nav>

        <div className="mb-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-border/70">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.02em] text-foreground">{household.primary_member_name}</h1>
              <div className="mt-1 text-[15px] text-muted">
                {[household.native_place, household.city, household.state, household.country].filter(Boolean).join(', ')}
              </div>
              {household.verified && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                  ✓ VERIFIED FAMILY RECORD
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Contact section */}
          <div className="animate-fade-in delay-1">
            <div className="bg-surface card p-5 border border-border shadow-md">
              <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Contact Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                {contactFields.map((field) => (
                  <div key={field.label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-muted flex-shrink-0">{field.icon}</span>
                    <div>
                      <div className="text-xs text-muted mb-0.5">{field.label}</div>
                      <PrivacyField value={field.value} isApproved={isApproved} />
                    </div>
                  </div>
                ))}
              </div>

              {!isApproved && (
                <div className="mt-5 rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-emerald-700">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Sign in with an approved account to view full contact details and family links.</span>
                  </div>
                </div>
              )}
            </div>

            {household.notes && isApproved && (
              <div className="mt-4 bg-surface card p-5 text-sm animate-fade-in delay-2 border border-border shadow-md">
                <div className="mb-2 text-xs font-semibold text-muted flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Notes
                </div>
                <p className="text-muted">{household.notes}</p>
              </div>
            )}
          </div>

          {/* Family Members */}
          <div className="animate-fade-in delay-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {isApproved ? 'Family Members' : 'Primary Member (full list for approved members)'}
              </div>
              {isApproved && (
                <>
                  <Link 
                    href={`/households/${id}/edit`} 
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 hover:bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Edit Household &amp; Members
                  </Link>
                  <Link 
                    href="/submit/new-household" 
                    className="text-xs text-muted hover:text-primary underline underline-offset-2 ml-3"
                    title="Add a new person or branch to this household"
                  >
                    + Add family member
                  </Link>
                </>
              )}
            </div>

            <div className="bg-surface card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>DOB</th>
                      {isApproved && <th>Occupation</th>}
                      <th>Education / Marital</th>
                      {isApproved && <th>Blood / Notes</th>}
                      {isApproved && <th>Mobile</th>}
                      {isApproved && <th>Family Links</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 && (
                      <tr><td colSpan={isApproved ? 8 : 4} className="p-8 text-center text-sm text-muted italic">No members recorded.</td></tr>
                    )}
                    {members.map((hm: any) => {
                      const p = hm.person || hm; // depending on query shape
                      // For approved, compute family links from relationships
                      let familyLinks = '';
                      if (isApproved && relationships.length > 0) {
                        const myRels = relationships.filter((r: any) => r.person_id === p.id || r.related_person_id === p.id);
                        familyLinks = myRels.slice(0, 3).map((r: any) => {
                          const otherId = r.person_id === p.id ? r.related_person_id : r.person_id;
                          // Find name from members if possible
                          const otherMember = members.find((m: any) => (m.person?.id || m.person_id) === otherId);
                          const otherName = otherMember ? (otherMember.person?.full_name || 'Family member') : 'Family member';
                          return `${r.relationship_type} of ${otherName}`;
                        }).join('; ');
                        if (myRels.length > 3) familyLinks += '...';
                      }
                      const isHead = hm.relationship_to_head === 'SELF';
                      return (
                        <tr key={hm.id} className={isHead ? 'bg-amber-50/30' : ''}>
                          <td className={`font-medium ${isHead ? 'text-emerald-700' : 'text-foreground'}`}>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-muted text-xs font-serif border border-border shadow-sm flex-shrink-0 overflow-hidden">
                                {p?.avatar_url ? (
                                  <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <img src="/images/hero-tree.png" alt="Family symbol" className="w-full h-full object-cover opacity-70" />
                                )}
                              </div>
                              <div>
                                {p?.full_name || '—'}
                                {p?.is_deceased && <span className="ml-1 text-muted">†</span>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${isHead ? 'bg-emerald-50 text-primary font-medium' : 'bg-surface text-muted'}`}>
                              {hm.relationship_to_head}
                            </span>
                          </td>
                          <td className="text-xs text-muted">{p?.date_of_birth || '—'}</td>
                          {isApproved && <td className="text-xs text-muted">{p?.occupation || '—'}</td>}
                          <td className="text-xs text-muted">
                            {p?.education || '—'}<br />
                            <span className="text-muted">{p?.marital_status || ''}</span>
                          </td>
                          {isApproved && (
                            <td className="text-xs text-muted">
                              {p?.blood_group || '—'}<br />
                              <span className="text-muted">{p?.notes ? p.notes.substring(0, 40) + (p.notes.length > 40 ? '...' : '') : ''}</span>
                            </td>
                          )}
                          {isApproved && (
                            <td className="text-xs">
                              <PrivacyField value={p?.mobile_number} isApproved={isApproved} />
                            </td>
                          )}
                          {isApproved && (
                            <td className="text-xs max-w-[180px] text-muted">{familyLinks || '—'}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center animate-fade-in delay-3">
          <Link href="/directory" className="text-sm text-muted hover:text-primary transition-colors inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to all households
          </Link>
        </div>
      </div>
    </div>
  );
}

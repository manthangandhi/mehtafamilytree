import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from './PrintButton';

export default async function PrintDirectoryPage() {
  const current = await getCurrentUserProfile();

  if (!current || !current.profile || current.profile.status !== 'approved') {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  
  // Fetch households
  const { data: households } = await supabase
    .from('households')
    .select(`
      *,
      household_members (
        *,
        persons (*)
      )
    `)
    .order('household_code');

  // Fetch all cultural pages
  const { data: culturalPages } = await supabase
    .from('cultural_pages')
    .select('*')
    .in('visibility_level', ['public', 'members'])
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-surface text-black p-4 sm:p-8 font-serif">
      
      {/* Non-printable header for desktop viewing */}
      <div className="print:hidden flex items-center justify-between mb-8 max-w-5xl mx-auto bg-surface-hover p-4 rounded-xl border border-border">
        <div className="font-sans">
          <h1 className="text-xl font-bold">Printable Family Book</h1>
          <p className="text-sm text-muted">Press Cmd+P (Mac) or Ctrl+P (Windows) to save as PDF or Print. Make sure to enable "Print Background Graphics".</p>
        </div>
        <div className="flex gap-3 font-sans">
          <Link href="/dashboard" className="btn btn-secondary">Back</Link>
          <PrintButton />
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 1.5cm;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0;
            margin: 0;
            font-size: 12pt;
          }
          nav {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
          .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          /* Print-specific typography adjustments */
          h1, h2, h3 {
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto">
        
        {/* Cover Page */}
        <div className="cover-page page-break print:h-screen print:flex print:flex-col print:justify-center print:items-center py-32 text-center border-b-8 border-primary print:border-none">
          <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl print:shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/></svg>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight text-primary">The Mehta Family</h1>
          <h2 className="text-2xl text-muted tracking-widest uppercase mb-12">Mehta Kutumb Heritage Record</h2>
          <div className="w-16 h-1 bg-primary/20 mx-auto mb-12"></div>
          <p className="text-sm text-muted font-sans uppercase tracking-widest">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Culture & History Section */}
        {culturalPages && culturalPages.length > 0 && (
          <div className="page-break pb-12 print:pb-0">
            <h1 className="text-4xl font-bold mb-12 uppercase tracking-widest border-b-2 border-primary inline-block pb-2">Family History & Culture</h1>
            <div className="space-y-16">
              {culturalPages.map(page => (
                <div key={page.id} className="avoid-break mb-12">
                  <h2 className="text-3xl font-bold mb-2 text-primary">{page.title}</h2>
                  <div className="text-xs uppercase tracking-widest text-muted mb-6 font-sans">{page.category} • {page.language}</div>
                  <div className="prose prose-stone max-w-none text-justify leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directory Section */}
        <div>
          <h1 className="text-4xl font-bold mb-12 uppercase tracking-widest border-b-2 border-primary inline-block pb-2 page-break">The Mehta Kutumb Households</h1>
          
          <div className="space-y-12">
            {(households as any[])?.map(household => (
              <div key={household.id} className="avoid-break bg-surface rounded-2xl border border-border p-8 print:p-6 print:border-2 print:border-gray-200">
                <div className="border-b-2 border-primary/20 pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{household.primary_member_name} Family</h2>
                    {household.household_code && <span className="text-xs font-mono font-bold tracking-widest text-muted uppercase mt-1 block">Household {household.household_code}</span>}
                  </div>
                  <div className="text-right text-sm text-stone-600 font-sans">
                    {household.residence_address && <div>{household.residence_address}</div>}
                    <div>{household.city}, {household.state} {household.country}</div>
                    {household.mobile_number && <div>{household.mobile_number}</div>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                  {household.household_members?.sort((a:any, b:any) => a.display_order - b.display_order).map((hm:any) => {
                    const person = hm.persons;
                    return (
                      <div key={hm.id} className="flex gap-4 items-start avoid-break">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden font-bold text-lg print:border-gray-300 print:text-black">
                           {person.image_url ? (
                             <img src={person.image_url} alt={person.full_name} className="w-full h-full object-cover grayscale" />
                           ) : (
                             <span>{person.full_name.charAt(0)}</span>
                           )}
                        </div>
                        <div className="font-sans">
                          <div className="font-bold text-foreground text-base">{person.full_name}</div>
                          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{hm.relationship_to_head}</div>
                          
                          <div className="text-sm text-stone-600 space-y-0.5 mt-2">
                            {person.date_of_birth && <div><span className="text-muted mr-2">DOB:</span>{person.date_of_birth}</div>}
                            {person.mobile_number && <div><span className="text-muted mr-2">Mob:</span>{person.mobile_number}</div>}
                            {person.email && <div><span className="text-muted mr-2">Email:</span>{person.email}</div>}
                            {person.blood_group && <div><span className="text-muted mr-2">Blood:</span>{person.blood_group}</div>}
                            {person.is_deceased && <div className="text-red-800 font-semibold mt-1">Deceased</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

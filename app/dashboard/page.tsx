import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import { format, isThisMonth, isThisWeek, parseISO, setYear, isAfter, isBefore, addDays } from 'date-fns';
import Image from 'next/image';

function getUpcomingCelebrations(persons: any[], households: any[]) {
  const today = new Date();
  const nextMonth = addDays(today, 30);
  
  const celebrations: any[] = [];

  persons.forEach(p => {
    if (p.date_of_birth) {
      const dob = parseISO(p.date_of_birth);
      const thisYearBirthday = setYear(dob, today.getFullYear());
      // If birthday already passed this year, look at next year
      const celebrationDate = isBefore(thisYearBirthday, today) ? setYear(dob, today.getFullYear() + 1) : thisYearBirthday;
      
      if (isBefore(celebrationDate, nextMonth)) {
        celebrations.push({
          type: 'Birthday',
          name: p.full_name,
          date: celebrationDate,
          originalDate: dob,
          avatarUrl: p.avatar_url,
          id: p.id
        });
      }
    }
  });

  households.forEach(h => {
    if (h.anniversary_date) {
      const anniv = parseISO(h.anniversary_date);
      const thisYearAnniv = setYear(anniv, today.getFullYear());
      const celebrationDate = isBefore(thisYearAnniv, today) ? setYear(anniv, today.getFullYear() + 1) : thisYearAnniv;
      
      if (isBefore(celebrationDate, nextMonth)) {
        celebrations.push({
          type: 'Anniversary',
          name: h.primary_member_name + ' & Family',
          date: celebrationDate,
          originalDate: anniv,
          id: h.id
        });
      }
    }
  });

  return celebrations.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
}

export default async function DashboardPage() {
  const current = await getCurrentUserProfile();

  if (!current || !current.profile) {
    redirect('/login');
  }

  const { profile, emailConfirmed } = current;
  const isApproved = profile.status === 'approved';
  const isPending = profile.status === 'pending';
  const isBlocked = profile.status === 'blocked' || profile.status === 'rejected';

  // Fetch dynamic data if approved
  let upcomingCelebrations: any[] = [];
  let recentUpdates: any[] = [];
  let announcements: any[] = [];

  if (isApproved) {
    const supabase = await createClient();
    
    // Fetch persons for birthdays
    const { data: persons } = await supabase
      .from('persons')
      .select('id, full_name, date_of_birth, avatar_url')
      .eq('is_deceased', false)
      .not('date_of_birth', 'is', null);

    // Fetch households for anniversaries
    const { data: households } = await supabase
      .from('households')
      .select('id, primary_member_name, anniversary_date')
      .not('anniversary_date', 'is', null);

    if (persons && households) {
      upcomingCelebrations = getUpcomingCelebrations(persons, households);
    }

    // Fetch recent updates
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id, action_type, table_name, performed_by, performed_at')
      .order('performed_at', { ascending: false })
      .limit(5);
    if (logs) recentUpdates = logs;

    // Fetch announcements
    const { data: ann } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (ann) announcements = ann;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        
        {/* Welcome Header */}
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {profile.full_name || 'Family Member'}</h1>
              <StatusBadge status={profile.status} />
              {profile.role === 'admin' && <StatusBadge status="admin" />}
            </div>
            <p className="text-[15px] text-muted">Your Mehta Kutumb family hub</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Link href="/directory/print" className="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
              Print Family Record
            </Link>
            <Link href="/announcements" className="btn btn-primary">
              View Announcements
            </Link>
          </div>
        </div>

        {/* Status Alerts */}
        {!emailConfirmed && (
          <div className="card mb-8 border-accent/30 bg-accent/5 p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-accent text-[15px]">Confirm your email address</div>
                <p className="mt-1 text-sm text-accent">Check your inbox for the confirmation link to fully unlock your account.</p>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="card mb-8 border-primary/30 bg-primary/5 p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-primary text-[15px]">Account awaiting approval</div>
                <p className="mt-1 text-sm text-primary">An admin will review your account shortly. You can browse public records in the meantime.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area (Quick Links & Announcements) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Announcements Section */}
            {isApproved && (
              <section className="premium-card p-8 animate-fade-in delay-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                    Family Announcements
                  </h2>
                  <Link href="/announcements" className="text-sm text-primary hover:opacity-80 font-medium">See all &rarr;</Link>
                </div>
                
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-5 rounded-xl bg-surface-hover border border-border/50 transition-all hover:border-accent/30">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-surface border border-accent/20 px-3 py-1 rounded-full shadow-sm">{ann.event_type}</span>
                          <span className="text-xs text-muted font-medium">{format(new Date(ann.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-foreground mb-1">{ann.title}</h3>
                        <p className="text-sm text-muted line-clamp-2 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface-hover rounded-xl border border-dashed border-border">
                    <p className="text-muted text-sm">No recent announcements to display.</p>
                  </div>
                )}
              </section>
            )}

            {/* Quick Actions */}
            <section className="card p-6 animate-fade-in delay-2">
               <h2 className="text-lg font-semibold text-foreground mb-5">Quick Actions</h2>
               <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/directory" className="group p-4 rounded-xl bg-surface-hover border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 font-medium text-foreground group-hover:text-primary">
                      <div className="p-2 bg-surface border border-border/50 rounded-lg shadow-sm">
                        <img src="/images/hero-tree.png" alt="" className="w-5 h-5 object-contain opacity-70" />
                      </div>
                      Search Households
                    </div>
                  </Link>
                  <Link href="/family-tree-visualizer" className="group p-4 rounded-xl bg-surface-hover border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 font-medium text-foreground group-hover:text-primary">
                      <div className="p-2 bg-surface border border-border/50 rounded-lg shadow-sm text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                      Explore Family Tree
                    </div>
                  </Link>
                  <Link href="/submit/new-household" className="group p-4 rounded-xl bg-surface-hover border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 font-medium text-foreground group-hover:text-primary">
                      <div className="p-2 bg-surface border border-border/50 rounded-lg shadow-sm text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                      Add Household
                    </div>
                  </Link>
                  <Link href="/my-requests" className="group p-4 rounded-xl bg-surface-hover border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 font-medium text-foreground group-hover:text-primary">
                      <div className="p-2 bg-surface border border-border/50 rounded-lg shadow-sm text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg></div>
                      My Requests
                    </div>
                  </Link>
               </div>
            </section>
          </div>

          {/* Sidebar Area (Celebrations & Updates) */}
          <div className="space-y-6">
            
            {/* Upcoming Celebrations Widget */}
            {isApproved && (
              <section className="premium-card p-6 animate-fade-in delay-2 border-t-4 border-t-accent">
                <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="text-accent">🎁</span> Upcoming Celebrations
                </h2>
                {upcomingCelebrations.length > 0 ? (
                  <ul className="space-y-5">
                    {upcomingCelebrations.map((celeb, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {celeb.avatarUrl ? (
                            <img src={celeb.avatarUrl} alt={celeb.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} />
                          ) : (
                            <Image src="/images/hero-tree.png" alt="Family symbol" width={40} height={40} className="w-full h-full object-cover opacity-70" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-foreground truncate">{celeb.name}</p>
                          <p className="text-xs text-muted font-medium mt-0.5 truncate">{format(celeb.date, 'MMM do')} • <span className="text-primary">{celeb.type}</span></p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 bg-surface-hover rounded-xl border border-dashed border-border">
                    <p className="text-muted text-sm">No celebrations in the next 30 days.</p>
                  </div>
                )}
              </section>
            )}

            {/* Recent Updates Widget */}
            {isApproved && (
              <section className="premium-card p-6 animate-fade-in delay-3">
                <h2 className="font-serif text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Recent Family Updates
                </h2>
                {recentUpdates.length > 0 ? (
                  <ul className="space-y-4">
                    {recentUpdates.map((log) => {
                      const readableTable = log.table_name === 'persons' ? 'Family Member' : log.table_name === 'households' ? 'Household' : log.table_name === 'announcements' ? 'Announcement' : log.table_name;
                      return (
                        <li key={log.id} className="text-sm border-l-2 border-accent/30 pl-3">
                          <span className="text-foreground font-semibold capitalize">{log.action_type}</span>{' '}
                          <span className="text-muted">{readableTable}</span>
                          <div className="text-[11px] font-medium text-muted mt-1">{format(new Date(log.performed_at), 'MMM d, h:mm a')}</div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8 bg-surface-hover rounded-xl border border-dashed border-border">
                    <p className="text-muted text-sm">No recent updates.</p>
                  </div>
                )}
              </section>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

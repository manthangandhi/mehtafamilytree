import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function AnnouncementsPage() {
  const current = await getCurrentUserProfile();

  if (!current || !current.profile || current.profile.status !== 'approved') {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: announcements, error } = await supabase
    .from('announcements')
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-12 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-primary font-serif">Family Announcements</h1>
            <p className="mt-2 text-muted">Major life events, reunions, and family news.</p>
          </div>
          {current.profile.role === 'admin' && (
            <Link href="/admin/announcements" className="btn btn-primary self-start md:self-auto shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New Post
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {announcements && announcements.length > 0 ? (
            (announcements as any[]).map((ann, i) => (
              <div key={ann.id} className={`bg-surface rounded-3xl p-6 md:p-8 animate-fade-in border border-border/50 ${i === 0 ? 'delay-1' : i === 1 ? 'delay-2' : 'delay-3'}`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider
                    ${ann.event_type === 'birth' ? 'bg-accent/10 text-primary' :
                      ann.event_type === 'marriage' ? 'bg-primary/5 text-primary' :
                      ann.event_type === 'reunion' ? 'bg-success/10 text-success' :
                      ann.event_type === 'passing' ? 'bg-surface-hover text-muted' :
                      'bg-accent/10 text-accent'
                    }`}>
                    {ann.event_type}
                  </span>
                  <span className="text-sm text-muted">
                    {format(new Date(ann.created_at), 'MMMM d, yyyy')}
                  </span>
                  <span className="text-sm text-muted ml-auto flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {ann.profiles?.full_name || 'Admin'}
                  </span>
                </div>
                <h2 className="font-serif text-foreground mb-3">{ann.title}</h2>
                <div className="prose-heritage max-w-none">
                  <p className="whitespace-pre-wrap text-muted leading-relaxed">{ann.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-surface rounded-[2rem] border border-border/50 animate-fade-in delay-1">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-variant mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              </div>
              <h3 className="font-serif text-foreground">No Announcements Yet</h3>
              <p className="text-muted mt-2">Check back later for family news and events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

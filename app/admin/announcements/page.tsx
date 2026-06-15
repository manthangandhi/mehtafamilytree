import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AdminAnnouncements() {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { data: announcements } = await adminClient
    .from('announcements')
    .select('id, title, event_type, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Announcements</h1>
          <p className="text-base text-muted mt-2 max-w-xl">Manage family announcements, events, and news broadcasted to all members.</p>
        </div>
        <Link href="/admin/announcements/new" className="bg-primary text-white shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-px inline-flex items-center justify-center px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide whitespace-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Announcement
        </Link>
      </div>

      <div className="bg-surface rounded-[2rem] border border-border/50 shadow-[0_10px_40px_-15px_rgba(141,79,17,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-surface/50 border-b border-border/50">
                <th className="py-4 px-6 font-semibold text-muted tracking-wide">Title</th>
                <th className="py-4 px-6 font-semibold text-muted tracking-wide">Event Type</th>
                <th className="py-4 px-6 font-semibold text-muted tracking-wide">Created At</th>
                <th className="py-4 px-6 font-semibold text-muted tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {announcements && announcements.length > 0 ? (
                (announcements as any[]).map((ann) => (
                  <tr key={ann.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{ann.title}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success capitalize">
                        {ann.event_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted">{format(new Date(ann.created_at), 'MMM d, yyyy')}</td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/admin/announcements/${ann.id}/edit`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <p className="text-lg font-medium">No announcements found</p>
                      <p className="text-sm mt-1">Get started by creating a new announcement.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

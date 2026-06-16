import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminOverview() {
  const adminClient = createAdminClient();

  const [{ count: pendingUsers }, { count: pendingRequests }, { count: activeHouseholds }] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('households').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-base text-muted mt-2">Manage the Mehta Kutumb family archive. All changes are securely audited.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Link href="/admin/users" className="bg-surface rounded-[2rem] border border-border/50 p-6 shadow-[0_10px_40px_-15px_rgba(141,79,17,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </div>
            {pendingUsers ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </span>
            ) : null}
          </div>
          <div>
            <div className="text-4xl font-bold font-serif text-foreground">{pendingUsers || 0}</div>
            <div className="text-sm font-medium text-muted mt-1">Pending user approvals</div>
          </div>
        </Link>
        
        <Link href="/admin/requests" className="bg-surface rounded-[2rem] border border-border/50 p-6 shadow-[0_10px_40px_-15px_rgba(141,79,17,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
            </div>
            {pendingRequests ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            ) : null}
          </div>
          <div>
            <div className="text-4xl font-bold font-serif text-foreground">{pendingRequests || 0}</div>
            <div className="text-sm font-medium text-muted mt-1">Pending change requests</div>
          </div>
        </Link>
        
        <Link href="/admin/households" className="bg-surface rounded-[2rem] border border-border/50 p-6 shadow-[0_10px_40px_-15px_rgba(141,79,17,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold font-serif text-foreground">{activeHouseholds || 0}</div>
            <div className="text-sm font-medium text-muted mt-1">Active households</div>
          </div>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link href="/admin/households/new" className="bg-primary text-white shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-px inline-flex items-center justify-center px-6 py-4 rounded-2xl font-sans text-sm font-semibold tracking-wide whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Create Household
          </Link>
          <Link href="/admin/culture/new" className="bg-surface border-2 border-primary text-primary hover:bg-primary/5 transition-all transform hover:-translate-y-px inline-flex items-center justify-center px-6 py-4 rounded-2xl font-sans text-sm font-semibold tracking-wide whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New Cultural Page
          </Link>
          <Link href="/admin/announcements/new" className="bg-surface border-2 border-border text-primary hover:bg-primary/5 transition-all transform hover:-translate-y-px inline-flex items-center justify-center px-6 py-4 rounded-2xl font-sans text-sm font-semibold tracking-wide whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Post Announcement
          </Link>
        </div>
      </div>

      <div className="mt-12 p-4 bg-surface/50 rounded-xl border border-border/50 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <p className="text-sm text-muted">
          All administrative actions are permanently recorded in the <Link href="/admin/audit-logs" className="text-primary hover:underline font-medium">audit log</Link> for accountability.
        </p>
      </div>
    </div>
  );
}

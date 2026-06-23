import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminOverview() {
  const adminClient = createAdminClient();

  let pendingUsers: number | null = null;
  let pendingRequests: number | null = null;
  let activeHouseholds: number | null = null;

  try {
    const [u, r, h] = await Promise.all([
      adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminClient.from('change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminClient.from('households').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);
    pendingUsers = u.count ?? null;
    pendingRequests = r.count ?? null;
    activeHouseholds = h.count ?? null;
  } catch (e) {
    console.warn('Admin overview stats failed (non-fatal):', e);
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-gray-800">Admin Dashboard</h1>
        <p className="text-base text-gray-500 mt-2 max-w-3xl">Manage registrations, life-event news, and directory governance. Registration approval required. After approval, members manage their own households directly (no further approvals needed).</p>
      </div>

      <div className="premium-card p-8 md:p-10 mb-8 flex-grow">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Link href="/admin/users" className="bg-gray-50 rounded-3xl border border-gray-100 p-8 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-emerald-100/50 rounded-2xl text-emerald-700 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              </div>
              {pendingUsers ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              ) : null}
            </div>
            <div>
              <div className="text-5xl font-extrabold font-serif text-gray-800">{pendingUsers || 0}</div>
              <div className="text-sm font-bold uppercase tracking-wide text-gray-500 mt-2">Pending user approvals</div>
            </div>
          </Link>
          
          <Link href="/admin/requests" className="bg-gray-50 rounded-3xl border border-gray-100 p-8 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-amber-100/50 rounded-2xl text-amber-700 group-hover:bg-amber-100 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
              </div>
              {pendingRequests ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              ) : null}
            </div>
            <div>
              <div className="text-5xl font-extrabold font-serif text-gray-800">{pendingRequests || 0}</div>
              <div className="text-sm font-bold uppercase tracking-wide text-gray-500 mt-2">Pending change requests</div>
            </div>
          </Link>
          
          <Link href="/admin/households" className="bg-gray-50 rounded-3xl border border-gray-100 p-8 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-blue-100/50 rounded-2xl text-blue-700 group-hover:bg-blue-100 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            </div>
            <div>
              <div className="text-5xl font-extrabold font-serif text-gray-800">{activeHouseholds || 0}</div>
              <div className="text-sm font-bold uppercase tracking-wide text-gray-500 mt-2">Active households</div>
            </div>
          </Link>
        </div>

        <div className="mt-12 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-serif font-bold mb-6 text-gray-800">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Link href="/admin/households/new" className="bg-primary text-white shadow-[0_8px_20px_rgb(11,46,36,0.2)] hover:bg-primary-hover hover:-translate-y-1 transition-all rounded-2xl inline-flex items-center justify-center px-6 py-5 font-bold tracking-wide whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M12 5v14"/><path d="M5 12h14"/><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" opacity="0.3"/></svg>
              Create Household
            </Link>
            <Link href="/admin/culture/new" className="bg-white border-2 border-primary text-primary shadow-sm hover:bg-emerald-50 hover:-translate-y-1 transition-all rounded-2xl inline-flex items-center justify-center px-6 py-5 font-bold tracking-wide whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>
              New Cultural Page
            </Link>
            <Link href="/admin/announcements/new" className="bg-white border-2 border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-1 transition-all rounded-2xl inline-flex items-center justify-center px-6 py-5 font-bold tracking-wide whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              Post Announcement
            </Link>
          </div>
        </div>

        {/* Community News & Governance (Admin-Only) */}
        <div className="mt-12 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-serif font-bold mb-6 text-gray-800">Community News & Directory Governance</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <Link href="/admin/announcements" className="bg-amber-50 border border-amber-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="font-bold text-amber-800 mb-1 text-base">📣 Broadcast Life Events</div>
              <div className="text-amber-600 font-medium">Births • Marriages • Obituaries</div>
            </Link>
            <Link href="/admin/users" className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="font-bold text-emerald-800 mb-1 text-base">👥 Registration Queue & Suspend</div>
              <div className="text-emerald-600 font-medium">Approve / Block / Make admin</div>
            </Link>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="text-gray-600 leading-relaxed font-medium">Governance tools: Use profile status=blocked to suspend. Edit persons to redact contact fields. All writes audited.</div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-400 mt-4">In-app notifications are sent on life event broadcasts. Full push (FCM/APNS) requires additional mobile setup.</p>
        </div>
      </div>

      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3 mt-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <p className="text-sm text-blue-800 font-medium leading-relaxed">
          All administrative actions are permanently recorded in the <Link href="/admin/audit-logs" className="text-blue-600 hover:text-blue-900 hover:underline font-bold">audit log</Link> for accountability. Members edit only their own data after approval.
        </p>
      </div>
    </div>
  );
}

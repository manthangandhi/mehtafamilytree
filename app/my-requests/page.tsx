import Link from 'next/link';
import { getMyChangeRequests } from '@/lib/actions/changeRequests';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function MyRequestsPage() {
  const current = await getCurrentUserProfile();
  if (!current?.profile) redirect('/login');

  const requests = await getMyChangeRequests();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader 
        title="My Requests"
        description="Legacy requests (if any). For your own household & family members, use 'Manage My Household' — updates are now immediate with no admin approval required."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
        }
      />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-10">
        <div className="premium-card p-8 md:p-10">
          {requests.length === 0 && (
            <EmptyState title="No requests yet" description="Submit a new household, correction, or mark-deceased request from your dashboard." />
          )}

      <div className="space-y-4">
        {requests.map((r: any) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{r.request_type.replace(/_/g, ' ')}</div>
                <div className="text-xs text-muted">Submitted {new Date(r.submitted_at).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>

            {r.status === 'rejected' && r.rejection_reason && (
              <div className="mt-3 rounded bg-accent/10 p-3 text-sm text-accent">
                <span className="font-medium">Rejection reason:</span> {r.rejection_reason}
              </div>
            )}

            <div className="mt-3 text-xs text-muted">
              Target: {r.target_table} {r.target_record_id && `(${r.target_record_id.slice(0, 8)}…)`}
            </div>
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
}

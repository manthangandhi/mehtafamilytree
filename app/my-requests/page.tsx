import Link from 'next/link';
import { getMyChangeRequests } from '@/lib/actions/changeRequests';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function MyRequestsPage() {
  const current = await getCurrentUserProfile();
  if (!current?.profile) redirect('/login');

  const requests = await getMyChangeRequests();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl">My Requests</h1>
        <p className="text-muted mt-2">
          Track the status of your submitted requests.
        </p>
      </div>

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
  );
}

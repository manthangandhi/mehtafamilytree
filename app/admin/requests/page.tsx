import Link from 'next/link';
import { getAllChangeRequests } from '@/lib/actions/changeRequests';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function AdminRequests() {
  const requests = await getAllChangeRequests();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Change Requests</h1>
      <p className="mb-4 text-sm text-muted">Review, compare, and approve or reject member-submitted changes.</p>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r: any) => (
              <tr key={r.id}>
                <td className="font-medium">{r.request_type}</td>
                <td>{r.submitted_by_profile?.full_name || r.submitted_by}</td>
                <td className="text-xs">{new Date(r.submitted_at).toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <Link href={`/admin/requests/${r.id}`} className="underline text-sm">Review</Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted">No requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

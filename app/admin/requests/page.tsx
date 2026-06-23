import Link from 'next/link';
import { getAllChangeRequests } from '@/lib/actions/changeRequests';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function AdminRequests() {
  const requests = await getAllChangeRequests();

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <h1 className="mb-6 text-3xl font-serif font-bold tracking-tight text-gray-800">Change Requests</h1>
      <p className="mb-8 text-sm text-gray-500 max-w-3xl">Review, compare, and approve or reject member-submitted changes.</p>

      <div className="premium-card overflow-hidden flex-grow">
        <div className="overflow-x-auto p-2">
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
    </div>
  );
}

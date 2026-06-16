import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getChangeRequestById, approveChangeRequestAction, rejectChangeRequestAction } from '@/lib/actions/changeRequests';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequestComparisonView } from '@/components/admin/RequestComparisonView';
import { Textarea } from '@/components/ui/Textarea';

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const result: any = await getChangeRequestById(id);

  if (!result.success || !result.request) notFound();
  const req = result.request;

  async function approve(formData: FormData) {
    'use server';
    const notes = formData.get('admin_notes') as string;
    await approveChangeRequestAction(id, notes || undefined);
  }

  async function reject(formData: FormData) {
    'use server';
    const reason = (formData.get('rejection_reason') as string) || 'No reason provided';
    const notes = formData.get('admin_notes') as string;
    await rejectChangeRequestAction(id, reason, notes || undefined);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/admin/requests" className="text-sm">← All Requests</Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">{req.request_type}</div>
          <h1 className="text-2xl font-semibold">Review Change Request</h1>
        </div>
        <div>Status: <span className="font-medium">{req.status}</span></div>
      </div>

      <div className="mt-4 text-sm">
        Submitted by: <span className="font-medium">{req.submitted_by_profile?.full_name}</span> on {new Date(req.submitted_at).toLocaleString()}
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold text-muted">PROPOSED DATA vs CURRENT</div>
        <RequestComparisonView current={req.current_data || {}} proposed={req.proposed_data || {}} />
      </div>

      {req.status === 'pending' && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Approve - prominent but with warning */}
          <form action={approve} className="card p-5 border-border">
            <div className="uppercase text-[10px] tracking-widest font-semibold text-primary mb-1">Approve &amp; Apply to Live Archive</div>
            <div className="text-sm mb-3 text-muted">This will immediately apply the proposed changes to the live tables and record an audit entry.</div>
            <Textarea name="admin_notes" label="Admin notes (optional)" placeholder="Verified with family elder / documents checked" />
            <Button type="submit" variant="primary" className="mt-3 w-full">Approve &amp; Apply Changes</Button>
          </form>

          {/* Reject */}
          <form action={reject} className="card p-5">
            <div className="uppercase text-[10px] tracking-widest font-semibold text-accent mb-1">Reject Request</div>
            <Textarea name="rejection_reason" label="Rejection reason (required)" placeholder="Unable to verify relationship / insufficient details" required />
            <Textarea name="admin_notes" label="Internal notes (optional)" />
            <Button type="submit" variant="secondary" className="mt-3 w-full text-accent hover:text-primary hover:bg-accent/10 border-accent/30">Reject This Request</Button>
            <p className="mt-2 text-xs text-muted">The submitter will see the reason in their My Requests page.</p>
          </form>
        </div>
      )}

      {req.status !== 'pending' && (
        <div className="mt-6 rounded border bg-surface p-4 text-sm">
          Reviewed by {req.reviewed_by_profile?.full_name || req.reviewed_by} on {req.reviewed_at ? new Date(req.reviewed_at).toLocaleString() : '—'}
          {req.rejection_reason && <div className="mt-2 text-accent">Reason: {req.rejection_reason}</div>}
        </div>
      )}
    </div>
  );
}

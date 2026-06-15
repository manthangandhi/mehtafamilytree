import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';

export default async function AdminHouseholdView({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: h } = await admin.from('households').select('*').eq('id', id).single();
  if (!h) notFound();
  const household = h as any;

  const { data: members } = await admin
    .from('household_members')
    .select('*, person:persons(full_name, relationship_to_head:household_members(relationship_to_head))')
    .eq('household_id', id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/admin/households" className="text-sm text-muted">← Households</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{household.primary_member_name}</h1>
      <div className="text-sm text-muted">{household.city}, {household.state} • {household.household_code || 'No code'}</div>

      <div className="mt-6 card p-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <div><span className="text-muted">Native place:</span> {household.native_place || '—'}</div>
        <div><span className="text-muted">Verified:</span> {household.verified ? 'Yes' : 'No'}</div>
        <div className="md:col-span-2"><span className="text-muted">Residence:</span> {household.residence_address || '—'}</div>
        <div className="md:col-span-2"><span className="text-muted">Notes:</span> {household.notes || '—'}</div>
      </div>

      <div className="mt-4">
        <Link href={`/admin/households/${id}/edit`} className="underline">Edit this household</Link>
      </div>
    </div>
  );
}

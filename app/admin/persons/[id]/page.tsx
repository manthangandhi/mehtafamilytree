import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deletePersonAdmin } from '@/lib/actions/persons';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminPersonView({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: p } = await admin.from('persons').select('*').eq('id', id).single();
  if (!p) notFound();
  const person = p as any;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/admin/persons" className="text-sm text-muted">← All Persons</Link>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">{person.full_name}</h1>
      <div className="mt-1 flex gap-4">
        <Link href={`/admin/persons/${id}/edit`} className="text-sm underline">Edit this person</Link>
        <DeleteButton
          action={async () => {
            'use server';
            await deletePersonAdmin(id);
          }}
          label="Delete Person"
          confirmMessage="Permanently delete this person and remove all links/relationships?"
        />
      </div>

      <div className="mt-6 card p-5 text-sm space-y-2">
        <div><span className="text-muted">Gender:</span> {person.gender || '—'}</div>
        <div><span className="text-muted">Born:</span> {person.date_of_birth || '—'} {person.is_deceased ? '†' : ''}</div>
        <div><span className="text-muted">Education:</span> {person.education || '—'}</div>
        <div><span className="text-muted">Occupation:</span> {person.occupation || '—'}</div>
        <div><span className="text-muted">Marital status:</span> {person.marital_status || '—'}</div>
        <div><span className="text-muted">Status:</span> {person.status}</div>
        {person.notes && <div className="pt-2 border-t"><span className="text-muted">Notes:</span> {person.notes}</div>}
      </div>
    </div>
  );
}

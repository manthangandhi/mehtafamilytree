import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { deleteHouseholdAdmin } from '@/lib/actions/households';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminHouseholds() {
  const admin = createAdminClient();

  const { data: households } = await admin
    .from('households')
    .select('id, household_code, primary_member_name, city, state, status, verified')
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-800">Households</h1>
        <Link href="/admin/households/new">
          <Button>Create Household</Button>
        </Link>
      </div>

      <div className="premium-card overflow-hidden flex-grow">
        <div className="overflow-x-auto p-2">
        <table className="table">
          <thead>
            <tr>
              <th>Primary</th>
              <th>Location</th>
              <th>Code</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(households || []).map((h: any) => (
              <tr key={h.id}>
                <td className="font-medium">{h.primary_member_name}</td>
                <td>{[h.city, h.state].filter(Boolean).join(', ')}</td>
                <td className="font-mono text-xs">{h.household_code || '—'}</td>
                <td><StatusBadge status={h.status} /></td>
                <td className="text-right">
                  <Link href={`/households/${h.id}/edit`} className="text-sm underline">Edit</Link>
                  {' · '}
                  <Link href={`/households/${h.id}`} className="text-sm underline" target="_blank">View</Link>
                  {' · '}
                  <DeleteButton
                    action={async () => {
                      'use server';
                      await deleteHouseholdAdmin(h.id);
                    }}
                    label="Delete"
                    confirmMessage="Delete this household? This will remove members and links."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

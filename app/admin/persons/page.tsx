import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { deletePersonAdmin } from '@/lib/actions/persons';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminPersons() {
  const admin = createAdminClient();
  const { data: persons } = await admin.from('persons').select('id, full_name, is_deceased, status').order('created_at', { ascending: false }).limit(100);

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <h1 className="mb-6 text-3xl font-serif font-bold tracking-tight text-gray-800">Persons</h1>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex-grow">
        <div className="overflow-x-auto p-2">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {(persons || []).map((p: any) => (
                <tr key={p.id}>
                  <td>{p.full_name}{p.is_deceased ? ' †' : ''}</td>
                  <td>{p.status}</td>
                  <td>
                    <Link href={`/admin/persons/${p.id}/edit`} className="underline text-sm">Edit</Link>
                    {' · '}
                    <DeleteButton
                      action={async () => {
                        'use server';
                        await deletePersonAdmin(p.id);
                      }}
                      label="Delete"
                      confirmMessage="Delete this person? This will remove all links and relationships."
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

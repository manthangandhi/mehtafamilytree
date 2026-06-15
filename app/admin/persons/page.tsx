import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export default async function AdminPersons() {
  const admin = createAdminClient();
  const { data: persons } = await admin.from('persons').select('id, full_name, is_deceased, status').order('created_at', { ascending: false }).limit(100);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Persons (Admin)</h1>
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(persons || []).map((p: any) => (
              <tr key={p.id}>
                <td>{p.full_name}{p.is_deceased ? ' †' : ''}</td>
                <td>{p.status}</td>
                <td><Link href={`/admin/persons/${p.id}/edit`} className="underline text-sm">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

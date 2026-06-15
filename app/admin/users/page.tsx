import { getAllUsers, updateUserStatusAction, confirmUserEmailAction } from '@/lib/actions/users';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">User Management</h1>
      <p className="mb-4 text-sm text-muted">Approve members and confirm their email so they can log in. Use "Confirm Email" for Supabase auth layer.</p>

      <div className="overflow-x-auto rounded border bg-surface">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td>{u.full_name || '—'}</td>
                <td className="font-mono text-xs text-muted">{u.email || '—'}</td>
                <td className="font-mono text-xs">{u.mobile_number || '—'}</td>
                <td><StatusBadge status={u.role} /></td>
                <td><StatusBadge status={u.status} /></td>
                <td>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={async () => { 'use server'; await confirmUserEmailAction(u.id); }}>
                      <Button size="sm" variant="secondary" title="Force confirm email (Supabase auth)">Confirm Email</Button>
                    </form>

                    {u.status !== 'approved' && (
                      <form action={async () => { 'use server'; await updateUserStatusAction(u.id, 'approve'); }}>
                        <Button size="sm" variant="secondary">Approve</Button>
                      </form>
                    )}
                    {u.status !== 'blocked' && (
                      <form action={async () => { 'use server'; await updateUserStatusAction(u.id, 'block'); }}>
                        <Button size="sm" variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50">Block</Button>
                      </form>
                    )}
                    {u.role !== 'admin' && (
                      <form action={async () => { 'use server'; await updateUserStatusAction(u.id, 'make_admin'); }}>
                        <Button size="sm" variant="secondary">Make Admin</Button>
                      </form>
                    )}
                    {u.role === 'admin' && (
                      <form action={async () => { 'use server'; await updateUserStatusAction(u.id, 'remove_admin'); }}>
                        <Button size="sm" variant="ghost">Remove Admin</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-sm">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

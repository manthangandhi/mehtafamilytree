import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAllCulturalPagesAdmin } from '@/lib/actions/culture';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';

export default async function AdminCulture() {
  await requireAdmin();
  const pages = await getAllCulturalPagesAdmin();

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-semibold">Cultural Pages</h1>
        <Link href="/admin/culture/new"><Button variant="primary">+ New Page</Button></Link>
      </div>

      <div className="space-y-3">
        {pages.map((p: any) => (
          <div key={p.id} className="card flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted">{p.category} · {p.visibility_level}</div>
            </div>
            <Link href={`/admin/culture/${p.id}/edit`} className="text-sm underline">Edit</Link>
          </div>
        ))}
        {pages.length === 0 && <div className="text-sm text-muted">No cultural pages yet.</div>}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAllCulturalPagesAdmin } from '@/lib/actions/culture';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';

export default async function AdminCulture() {
  await requireAdmin();
  const pages = await getAllCulturalPagesAdmin();

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-800">Cultural Pages</h1>
        <Link href="/admin/culture/new"><Button variant="primary">New Page</Button></Link>
      </div>

      <div className="premium-card p-8 flex-grow">
        <div className="space-y-4">
          {pages.map((p: any) => (
            <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between p-5 hover:border-primary/30 transition-colors">
              <div>
                <div className="font-bold text-gray-800 text-lg mb-1">{p.title}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{p.visibility_level}</div>
              </div>
              <Link href={`/admin/culture/${p.id}/edit`} className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-primary hover:bg-primary/5 transition-colors border border-gray-100">Edit</Link>
            </div>
          ))}
          {pages.length === 0 && <div className="text-sm font-medium text-gray-500 text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">No cultural pages yet.</div>}
        </div>
      </div>
    </div>
  );
}

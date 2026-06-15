import { requireAdmin } from '@/lib/auth/requireAdmin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side protection for ALL /admin routes.
  // Every sub-page is guaranteed to have an approved admin.
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-surface-hover">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

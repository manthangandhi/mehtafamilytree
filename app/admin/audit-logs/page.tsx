import { createAdminClient } from '@/lib/supabase/admin';

export default async function AuditLogs() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from('audit_logs')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(200);

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1400px] mx-auto w-full animate-fade-in flex-grow flex flex-col">
      <h1 className="mb-6 text-3xl font-serif font-bold tracking-tight text-gray-800">Audit Logs</h1>
      <p className="mb-8 text-sm text-gray-500 max-w-3xl">Complete record of all privileged admin and system actions.</p>
      
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex-grow">
        <div className="overflow-x-auto p-2">
          <table className="table text-xs">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Table</th>
                <th>Record</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((l: any) => (
                <tr key={l.id}>
                  <td>{new Date(l.performed_at).toLocaleString()}</td>
                  <td className="font-medium">{l.action_type}</td>
                  <td>{l.table_name}</td>
                  <td className="font-mono">{l.record_id?.slice(0, 8) || '—'}</td>
                  <td>{l.performed_by?.slice(0, 8) || 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { createAdminClient } from '@/lib/supabase/admin';

export default async function AuditLogs() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from('audit_logs')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(200);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Audit Logs</h1>
      <p className="mb-4 text-sm text-muted">Complete record of all privileged admin and system actions.</p>
      <div className="card overflow-auto">
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
  );
}

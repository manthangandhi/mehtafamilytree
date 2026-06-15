import { createAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/lib/supabase/database.types';

type AuditInput = {
  action_type: string;
  table_name: string;
  record_id?: string | null;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  performed_by?: string | null;
  notes?: string | null;
};

/**
 * Inserts an audit log entry using the service role client.
 * Safe to call from any server action.
 */
export async function logAudit(input: AuditInput) {
  const supabase = createAdminClient();

  const { error } = await (supabase.from('audit_logs') as any).insert({
    action_type: input.action_type,
    table_name: input.table_name,
    record_id: input.record_id ?? null,
    old_data: input.old_data ?? null,
    new_data: input.new_data ?? null,
    performed_by: input.performed_by ?? null,
    notes: input.notes ?? null,
  });

  if (error) {
    console.error('Failed to write audit log:', error);
    // Audit failure should not break main flow (logged for investigation)
  }
}

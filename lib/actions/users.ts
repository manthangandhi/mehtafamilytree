'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { logAudit } from './audit';

/**
 * Admin: list all profiles with basic info
 */
export async function getAllUsers() {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, full_name, email, mobile_number, role, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllUsers', error);
    return [];
  }
  return data ?? [];
}

/**
 * Admin actions on users
 */
export async function updateUserStatusAction(
  userId: string,
  action: 'approve' | 'reject' | 'block' | 'unblock' | 'make_admin' | 'remove_admin'
) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  if (userId === current.id) {
    return { success: false, error: 'You cannot modify your own account status here.' };
  }

  const { data: targetRaw } = await (adminClient.from('profiles') as any)
    .select('*')
    .eq('id', userId)
    .single();
  const target: any = targetRaw;

  if (!target) return { success: false, error: 'User not found' };

  let newRole = target.role;
  let newStatus = target.status;

  switch (action) {
    case 'approve':
      newStatus = 'approved';
      break;
    case 'reject':
      newStatus = 'rejected';
      break;
    case 'block':
      newStatus = 'blocked';
      break;
    case 'unblock':
      newStatus = 'pending';
      break;
    case 'make_admin':
      newRole = 'admin';
      newStatus = 'approved';
      break;
    case 'remove_admin':
      newRole = 'member';
      break;
    default:
      return { success: false, error: 'Unknown action' };
  }

  const { error } = await (adminClient.from('profiles') as any)
    .update({ role: newRole, status: newStatus })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: `USER_${action.toUpperCase()}`,
    table_name: 'profiles',
    record_id: userId,
    old_data: { role: target.role, status: target.status },
    new_data: { role: newRole, status: newStatus },
    performed_by: current.id,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin');

  return { success: true };
}

/**
 * Admin: Force-confirm a user's email in Supabase Auth (bypasses confirmation email).
 * This is useful for family directories where an admin is manually vetting people.
 */
export async function confirmUserEmailAction(userId: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  try {
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await logAudit({
      action_type: 'USER_EMAIL_CONFIRMED',
      table_name: 'auth.users',
      record_id: userId,
      performed_by: current.id,
      notes: 'Admin manually confirmed email via service role',
    });

    revalidatePath('/admin/users');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to confirm email' };
  }
}


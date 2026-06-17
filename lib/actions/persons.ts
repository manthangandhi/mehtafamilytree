'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApprovedMember } from '@/lib/auth/requireApprovedMember';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { logAudit } from './audit';

/**
 * Get persons for selection in forms (approved members + admins)
 */
export async function getPersonsForSelection(search?: string) {
  await requireApprovedMember();
  const supabase = await createClient();

  let query = supabase
    .from('persons')
    .select('id, full_name, date_of_birth, is_deceased')
    .eq('status', 'active')
    .order('full_name')
    .limit(200);

  if (search && search.length > 1) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Admin: get single person
 */
export async function getPersonByIdAdmin(id: string) {
  await requireAdmin();
  const adminClient = createAdminClient();
  const { data } = await adminClient.from('persons').select('*').eq('id', id).single();
  return data;
}

/**
 * Get household members for a household (respects privacy via RLS + server logic)
 */
export async function getHouseholdMembers(householdId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('household_members')
    .select(`
      id,
      relationship_to_head,
      display_order,
      is_primary,
      person:persons (
        id, full_name, gender, date_of_birth, date_of_death, is_deceased,
        education, occupation, marital_status, mobile_number, whatsapp_number,
        email, blood_group, notes
      )
    `)
    .eq('household_id', householdId)
    .order('display_order', { ascending: true });

  return data ?? [];
}

/**
 * ADMIN: Hard delete a person (cleanup links first: household_members, relationships).
 * Use with caution.
 */
export async function deletePersonAdmin(personId: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { data: oldP } = await adminClient.from('persons').select('*').eq('id', personId).single();

  // Remove from all households
  await adminClient.from('household_members').delete().eq('person_id', personId);

  // Remove all relationships involving this person
  await adminClient
    .from('relationships')
    .delete()
    .or(`person_id.eq.${personId},related_person_id.eq.${personId}`);

  // Clear as primary from any household
  await (adminClient.from('households') as any)
    .update({ primary_person_id: null })
    .eq('primary_person_id', personId);

  // Delete the person
  const { error } = await adminClient.from('persons').delete().eq('id', personId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'ADMIN_DELETE_PERSON',
    table_name: 'persons',
    record_id: personId,
    old_data: oldP,
    new_data: null,
    performed_by: current.id,
  });

  revalidatePath('/admin/persons');
  revalidatePath('/directory');

  return { success: true };
}

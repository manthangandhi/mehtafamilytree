'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireApprovedMember } from '@/lib/auth/requireApprovedMember';
import { requireAdmin } from '@/lib/auth/requireAdmin';

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

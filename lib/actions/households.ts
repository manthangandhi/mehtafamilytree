'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import {
  createHouseholdWithMembersSchema,
  householdSchema,
  familyMemberRowSchema,
  FamilyMemberRow,
} from '@/lib/validations/household';
import { logAudit } from './audit';
import { Database } from '@/lib/supabase/database.types';

type HouseholdInsert = Database['public']['Tables']['households']['Insert'];
type PersonInsert = Database['public']['Tables']['persons']['Insert'];

/**
 * ADMIN ONLY: Create a full household + persons + household_members in one transaction-like flow.
 * Also creates basic spouse/child relationships when obvious from relationship_to_head.
 */
export async function createHouseholdAction(formData: unknown) {
  const current = await requireAdmin();

  const parsed = createHouseholdWithMembersSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', issues: parsed.error.issues };
  }

  const { household: hData, members } = parsed.data;
  const adminClient = createAdminClient();

  try {
    // 1. Create the primary person first (SELF)
    const primaryRow = members.find((m) => m.relationship_to_head === 'SELF');
    if (!primaryRow) {
      return { success: false, error: 'Primary member (SELF) is required' };
    }

    const primaryPersonInsert: PersonInsert = {
      full_name: primaryRow.full_name,
      gender: primaryRow.gender ?? null,
      date_of_birth: primaryRow.date_of_birth || null,
      date_of_death: primaryRow.date_of_death || null,
      is_deceased: primaryRow.is_deceased ?? false,
      education: primaryRow.education || null,
      occupation: primaryRow.occupation || null,
      marital_status: primaryRow.marital_status || null,
      mobile_number: primaryRow.mobile_number || null,
      whatsapp_number: primaryRow.whatsapp_number || null,
      email: primaryRow.email || null,
      blood_group: primaryRow.blood_group || null,
      notes: primaryRow.notes || null,
      created_by: current.id,
    };

    const { data: primaryPerson, error: pErr } = await (adminClient.from('persons') as any)
      .insert(primaryPersonInsert)
      .select()
      .single();

    if (pErr || !primaryPerson) {
      throw new Error(pErr?.message || 'Failed to create primary person');
    }

    // 2. Create household
    const householdInsert: HouseholdInsert = {
      household_code: hData.household_code || null,
      primary_member_name: hData.primary_member_name,
      primary_person_id: primaryPerson.id,
      native_place: hData.native_place || null,
      residence_address: hData.residence_address || null,
      business_address: hData.business_address || null,
      phone_number: hData.phone_number || null,
      mobile_number: hData.mobile_number || null,
      whatsapp_number: hData.whatsapp_number || null,
      email: hData.email || null,
      city: hData.city || null,
      state: hData.state || null,
      country: hData.country || 'India',
      notes: hData.notes || null,
      verified: hData.verified ?? false,
      visibility_level: hData.visibility_level,
      status: hData.status,
      created_by: current.id,
    };

    const { data: household, error: hErr } = await (adminClient.from('households') as any)
      .insert(householdInsert)
      .select()
      .single();

    if (hErr || !household) {
      // Best effort soft cleanup (prefer soft-delete)
      await (adminClient.from('persons') as any)
        .update({ status: 'inactive' })
        .eq('id', primaryPerson.id);
      throw new Error(hErr?.message || 'Failed to create household');
    }

    // 3. Create household_members + other persons
    const memberInserts: any[] = [];
    const personIdsCreated: string[] = [primaryPerson.id];

    // Primary member
    memberInserts.push({
      household_id: household.id,
      person_id: primaryPerson.id,
      relationship_to_head: 'SELF',
      display_order: 1,
      is_primary: true,
    });

    let displayOrder = 2;
    let lastWifeId: string | null = null; // Track most recent spouse to correctly link children (for identifying "wife of which son/child" in multi-spouse households)

    for (const m of members) {
      if (m.relationship_to_head === 'SELF') continue;

      // Create person
      const personInsert: PersonInsert = {
        full_name: m.full_name,
        gender: m.gender ?? null,
        date_of_birth: m.date_of_birth || null,
        date_of_death: m.date_of_death || null,
        is_deceased: m.is_deceased ?? false,
        education: m.education || null,
        occupation: m.occupation || null,
        marital_status: m.marital_status || null,
        mobile_number: m.mobile_number || null,
        whatsapp_number: m.whatsapp_number || null,
        email: m.email || null,
        blood_group: m.blood_group || null,
        notes: m.notes || null,
        created_by: current.id,
      };

      const { data: newPerson, error: perErr } = await (adminClient.from('persons') as any)
        .insert(personInsert)
        .select()
        .single();

      if (perErr || !newPerson) {
        console.error('Failed creating family member person', perErr);
        continue;
      }

      personIdsCreated.push(newPerson.id);

      memberInserts.push({
        household_id: household.id,
        person_id: newPerson.id,
        relationship_to_head: m.relationship_to_head,
        display_order: displayOrder++,
        is_primary: false,
      });

      // Create simple relationships for common cases (spouse / child)
      // Track last wife to properly link children in multi-spouse households
      // This allows identifying "which wife of which child/son"
      if (['WIFE', 'HUSBAND'].includes(m.relationship_to_head)) {
        lastWifeId = newPerson.id;
        await (adminClient.from('relationships') as any).insert([
          {
            person_id: primaryPerson.id,
            related_person_id: newPerson.id,
            relationship_type: 'spouse',
            created_by: current.id,
          },
          {
            person_id: newPerson.id,
            related_person_id: primaryPerson.id,
            relationship_type: 'spouse',
            created_by: current.id,
          },
        ]);
      }

      if (['SON', 'DAUGHTER'].includes(m.relationship_to_head)) {
        // Link to head
        await (adminClient.from('relationships') as any).insert({
          person_id: primaryPerson.id,
          related_person_id: newPerson.id,
          relationship_type: 'child',
          created_by: current.id,
        });
        // Link to most recent wife (mother) if present in input order
        if (lastWifeId) {
          await (adminClient.from('relationships') as any).insert([
            {
              person_id: lastWifeId,
              related_person_id: newPerson.id,
              relationship_type: 'child',
              created_by: current.id,
            },
            {
              person_id: newPerson.id,
              related_person_id: lastWifeId,
              relationship_type: 'mother',
              created_by: current.id,
            },
          ]);
        }
      }
    }

    // Bulk insert household members
    if (memberInserts.length > 0) {
      const { error: hmErr } = await (adminClient.from('household_members') as any).insert(memberInserts);
      if (hmErr) {
        console.error('Household member link error', hmErr);
      }
    }

    await logAudit({
      action_type: 'CREATE_HOUSEHOLD',
      table_name: 'households',
      record_id: household.id,
      new_data: { ...household, member_count: memberInserts.length },
      performed_by: current.id,
      notes: `Created with ${memberInserts.length} members (including head)`,
    });

    revalidatePath('/admin/households');
    revalidatePath('/directory');
    revalidatePath('/dashboard');

    return { success: true, householdId: household.id };
  } catch (err: any) {
    console.error('createHouseholdAction error', err);
    return { success: false, error: err.message || 'Failed to create household' };
  }
}

/**
 * ADMIN: Update basic household fields (not members - use separate member ops or full edit page)
 */
export async function updateHouseholdAction(householdId: string, data: unknown) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const parsed = householdSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid data' };
  }

  const { data: oldHousehold } = await adminClient
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single();

  const { data: updated, error } = await (adminClient.from('households') as any)
    .update({
      ...parsed.data,
      updated_by: current.id,
    })
    .eq('id', householdId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await logAudit({
    action_type: 'UPDATE_HOUSEHOLD',
    table_name: 'households',
    record_id: householdId,
    old_data: oldHousehold,
    new_data: updated,
    performed_by: current.id,
  });

  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath(`/admin/households/${householdId}/edit`);
  revalidatePath('/directory');
  revalidatePath(`/households/${householdId}`);

  return { success: true };
}

/**
 * Soft delete household (status = inactive). Hard delete is not exposed in the UI.
 */
export async function deactivateHouseholdAction(householdId: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { data: oldH } = await adminClient.from('households').select('*').eq('id', householdId).single();

  const { error } = await (adminClient.from('households') as any)
    .update({ status: 'inactive', updated_by: current.id })
    .eq('id', householdId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'DEACTIVATE_HOUSEHOLD',
    table_name: 'households',
    record_id: householdId,
    old_data: oldH,
    new_data: { status: 'inactive' },
    performed_by: current.id,
  });

  revalidatePath('/admin/households');
  revalidatePath('/directory');

  return { success: true };
}

/**
 * ADMIN: Add additional family members to an existing household (e.g. if missed during creation).
 * Creates persons, household_members links, and basic relationships.
 */
export async function addMembersToHouseholdAction(householdId: string, membersData: unknown) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const parsed = z.array(familyMemberRowSchema).safeParse(membersData);
  if (!parsed.success) {
    return { success: false, error: 'Invalid member data' };
  }

  const members = parsed.data;

  try {
    // Get the primary person for relationship links
    const { data: household } = await (adminClient.from('households') as any)
      .select('primary_person_id')
      .eq('id', householdId)
      .single();

    const primaryPersonId = household?.primary_person_id;

    let displayOrder = 1; // start; in real could query max

    for (const m of members) {
      if (m.relationship_to_head === 'SELF') continue; // shouldn't add duplicate head

      const personInsert: PersonInsert = {
        full_name: m.full_name,
        gender: m.gender ?? null,
        date_of_birth: m.date_of_birth || null,
        date_of_death: m.date_of_death || null,
        is_deceased: m.is_deceased ?? false,
        education: m.education || null,
        occupation: m.occupation || null,
        marital_status: m.marital_status || null,
        mobile_number: m.mobile_number || null,
        whatsapp_number: m.whatsapp_number || null,
        email: m.email || null,
        blood_group: m.blood_group || null,
        notes: m.notes || null,
        created_by: current.id,
      };

      const { data: newPerson, error: perErr } = await (adminClient.from('persons') as any)
        .insert(personInsert)
        .select()
        .single();

      if (perErr || !newPerson) {
        console.error('Failed creating additional family member person', perErr);
        continue;
      }

      await (adminClient.from('household_members') as any).insert({
        household_id: householdId,
        person_id: newPerson.id,
        relationship_to_head: m.relationship_to_head,
        display_order: displayOrder++,
        is_primary: false,
      });

      // Create basic relationships if we have the primary
      if (primaryPersonId) {
        if (['WIFE', 'HUSBAND'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert([
            {
              person_id: primaryPersonId,
              related_person_id: newPerson.id,
              relationship_type: 'spouse',
              created_by: current.id,
            },
            {
              person_id: newPerson.id,
              related_person_id: primaryPersonId,
              relationship_type: 'spouse',
              created_by: current.id,
            },
          ]);
        }

        if (['SON', 'DAUGHTER'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert({
            person_id: primaryPersonId,
            related_person_id: newPerson.id,
            relationship_type: 'child',
            created_by: current.id,
          });
        }
      }
    }

    await logAudit({
      action_type: 'ADMIN_ADD_HOUSEHOLD_MEMBERS',
      table_name: 'household_members',
      record_id: householdId,
      new_data: { added_count: members.length },
      performed_by: current.id,
    });

    revalidatePath(`/admin/households/${householdId}`);
    revalidatePath(`/admin/households/${householdId}/edit`);
    revalidatePath('/directory');
    revalidatePath(`/households/${householdId}`);

    return { success: true };
  } catch (err: any) {
    console.error('addMembersToHouseholdAction error', err);
    return { success: false, error: err.message || 'Failed to add members' };
  }
}

/**
 * MEMBER SUBMISSION: Submit new household as change request (does NOT create live data)
 */
export async function submitNewHouseholdRequestAction(input: unknown) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Only approved members can submit requests' };
  }

  const parsed = createHouseholdWithMembersSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', issues: parsed.error.issues };
  }

  const supabase = await createClient();

  const { error } = await (supabase.from('change_requests') as any).insert({
    request_type: 'add_household',
    target_table: 'households',
    submitted_by: current.id,
    status: 'pending',
    proposed_data: {
      household: parsed.data.household,
      members: parsed.data.members,
    },
    current_data: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/my-requests');

  return { success: true };
}

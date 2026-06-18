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
      avatar_url: primaryRow.avatar_url || null,
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
        avatar_url: m.avatar_url || null,
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
 * ADMIN: Hard delete a household (with cleanup of members).
 * Use with caution. For soft, use deactivateHouseholdAction.
 */
export async function deleteHouseholdAdmin(householdId: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { data: oldH } = await adminClient.from('households').select('*').eq('id', householdId).single();

  // Remove member links first
  await adminClient.from('household_members').delete().eq('household_id', householdId);

  // Delete the household
  const { error } = await adminClient.from('households').delete().eq('id', householdId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'ADMIN_DELETE_HOUSEHOLD',
    table_name: 'households',
    record_id: householdId,
    old_data: oldH,
    new_data: null,
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
        avatar_url: m.avatar_url || null,
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

/* ============================================================
   DIRECT MEMBER ACTIONS (approved users manage ONLY their own)
   No admin approval step. RLS + ownership checks enforce.
============================================================ */

/**
 * Get the household owned/managed by the current approved user (by created_by or owner_profile_id).
 */
export async function getMyHousehold() {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return null;
  }
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from('member_households_view')
      .select('*')
      .or(`created_by.eq.${current.id},owner_profile_id.eq.${current.id}`)
      .eq('status', 'active')
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/**
 * MEMBER (owner): Create a new household + primary SELF + members.
 * Only one household per user enforced at action level (simple check).
 */
export async function createMyHouseholdAction(formData: unknown) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Only approved members can create their household' };
  }

  const parsed = createHouseholdWithMembersSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', issues: parsed.error.issues };
  }

  // Enforce single household per owner (simple)
  const existing = await getMyHousehold();
  if (existing) {
    return { success: false, error: 'You already have a household. Edit your existing one instead.' };
  }

  const { household: hData, members } = parsed.data;
  const supabase = await createClient(); // RLS will allow insert for owner
  // For multi-row safety we use admin client after checks
  const adminClient = createAdminClient();

  try {
    const primaryRow = members.find((m) => m.relationship_to_head === 'SELF');
    if (!primaryRow) {
      return { success: false, error: 'Primary member (SELF) is required' };
    }

    const primaryPersonInsert: any = {
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
      avatar_url: primaryRow.avatar_url || null,
      notes: primaryRow.notes || null,
      created_by: current.id,
      father_id: (primaryRow as any).father_id || null,
      mother_id: (primaryRow as any).mother_id || null,
      spouse_id: (primaryRow as any).spouse_id || null,
    };

    const { data: primaryPerson, error: pErr } = await (adminClient.from('persons') as any)
      .insert(primaryPersonInsert)
      .select()
      .single();

    if (pErr || !primaryPerson) throw new Error(pErr?.message || 'Failed to create primary person');

    const householdInsert: any = {
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
      verified: false, // members cannot self-verify
      visibility_level: hData.visibility_level || 'members',
      status: hData.status || 'active',
      created_by: current.id,
      owner_profile_id: current.id,
    };

    const { data: household, error: hErr } = await (adminClient.from('households') as any)
      .insert(householdInsert)
      .select()
      .single();

    if (hErr || !household) throw new Error(hErr?.message || 'Failed to create household');

    // Insert SELF household_member
    await (adminClient.from('household_members') as any).insert({
      household_id: household.id,
      person_id: primaryPerson.id,
      relationship_to_head: 'SELF',
      display_order: 0,
      is_primary: true,
      created_at: new Date().toISOString(),
    });

    // Add other members + basic rels (same as admin flow)
    let displayOrder = 1;
    for (const m of members) {
      if (m.relationship_to_head === 'SELF') continue;

      const pInsert: any = {
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
        avatar_url: m.avatar_url || null,
        notes: m.notes || null,
        created_by: current.id,
        father_id: (m as any).father_id || null,
        mother_id: (m as any).mother_id || null,
        spouse_id: (m as any).spouse_id || null,
      };

      const { data: newP } = await (adminClient.from('persons') as any)
        .insert(pInsert).select().single();

      if (newP) {
        await (adminClient.from('household_members') as any).insert({
          household_id: household.id,
          person_id: newP.id,
          relationship_to_head: m.relationship_to_head,
          display_order: displayOrder++,
          is_primary: false,
        });

        // basic spouse/child relationships
        if (['WIFE', 'HUSBAND'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert([
            { person_id: primaryPerson.id, related_person_id: newP.id, relationship_type: 'spouse', created_by: current.id },
            { person_id: newP.id, related_person_id: primaryPerson.id, relationship_type: 'spouse', created_by: current.id },
          ]);
        }
        if (['SON', 'DAUGHTER'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert({
            person_id: primaryPerson.id, related_person_id: newP.id, relationship_type: 'child', created_by: current.id,
          });
        }
      }
    }

    await logAudit({
      action_type: 'MEMBER_CREATE_HOUSEHOLD',
      table_name: 'households',
      record_id: household.id,
      new_data: { primary: primaryRow.full_name },
      performed_by: current.id,
    });

    revalidatePath('/directory');
    revalidatePath('/dashboard');
    revalidatePath(`/households/${household.id}`);
    revalidatePath('/family-tree');
    revalidatePath('/family-tree-visualizer');

    return { success: true, householdId: household.id };
  } catch (err: any) {
    console.error('createMyHouseholdAction', err);
    return { success: false, error: err.message || 'Failed to create household' };
  }
}

/**
 * MEMBER (owner): Update core household fields.
 */
export async function updateMyHouseholdAction(householdId: string, data: unknown) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Not authorized' };
  }

  const parsed = householdSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Invalid data' };
  }

  // Verify ownership OR admin override
  const supabase = await createClient();
  const { data: h } = await (supabase.from('households') as any)
    .select('id, created_by, owner_profile_id')
    .eq('id', householdId)
    .single();

  const isOwner = h && (h.created_by === current.id || h.owner_profile_id === current.id);
  const isAdmin = current.profile.role === 'admin';
  if (!isOwner && !isAdmin) {
    return { success: false, error: 'You can only edit your own household' };
  }

  const adminClient = createAdminClient();
  const { data: oldH } = await adminClient.from('households').select('*').eq('id', householdId).single();

  const { data: updated, error } = await (adminClient.from('households') as any)
    .update({ ...parsed.data, updated_by: current.id })
    .eq('id', householdId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'MEMBER_UPDATE_HOUSEHOLD',
    table_name: 'households',
    record_id: householdId,
    old_data: oldH,
    new_data: updated,
    performed_by: current.id,
  });

  revalidatePath('/directory');
  revalidatePath(`/households/${householdId}`);
  revalidatePath(`/households/${householdId}/edit`);
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * MEMBER (owner): Add family member(s) to own household (direct, no approval).
 */
export async function addMembersToMyHouseholdAction(householdId: string, membersData: unknown) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Not authorized' };
  }

  const parsed = z.array(familyMemberRowSchema).safeParse(membersData);
  if (!parsed.success) return { success: false, error: 'Invalid member data' };

  const adminClient = createAdminClient();

  // Verify owner OR admin override
  const { data: h } = await (adminClient.from('households') as any)
    .select('id, created_by, owner_profile_id, primary_person_id')
    .eq('id', householdId).single();

  const isOwner = h && (h.created_by === current.id || h.owner_profile_id === current.id);
  const isAdmin = current.profile.role === 'admin';
  if (!isOwner && !isAdmin) return { success: false, error: 'You can only add members to your own household' };

  const primaryPersonId = h.primary_person_id;
  const members = parsed.data;
  let displayOrder = 1;

  try {
    for (const m of members) {
      if (m.relationship_to_head === 'SELF') continue;

      const pInsert: any = {
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
        avatar_url: m.avatar_url || null,
        notes: m.notes || null,
        created_by: current.id,
        father_id: (m as any).father_id || null,
        mother_id: (m as any).mother_id || null,
        spouse_id: (m as any).spouse_id || null,
      };

      const { data: newPerson } = await (adminClient.from('persons') as any)
        .insert(pInsert).select().single();

      if (newPerson) {
        await (adminClient.from('household_members') as any).insert({
          household_id: householdId,
          person_id: newPerson.id,
          relationship_to_head: m.relationship_to_head,
          display_order: displayOrder++,
          is_primary: false,
        });

        if (primaryPersonId && ['WIFE', 'HUSBAND'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert([
            { person_id: primaryPersonId, related_person_id: newPerson.id, relationship_type: 'spouse', created_by: current.id },
            { person_id: newPerson.id, related_person_id: primaryPersonId, relationship_type: 'spouse', created_by: current.id },
          ]);
        }
        if (primaryPersonId && ['SON', 'DAUGHTER'].includes(m.relationship_to_head)) {
          await (adminClient.from('relationships') as any).insert({
            person_id: primaryPersonId, related_person_id: newPerson.id, relationship_type: 'child', created_by: current.id,
          });
        }
      }
    }

    await logAudit({
      action_type: 'MEMBER_ADD_HOUSEHOLD_MEMBERS',
      table_name: 'household_members',
      record_id: householdId,
      performed_by: current.id,
    });

    revalidatePath(`/households/${householdId}`);
    revalidatePath(`/households/${householdId}/edit`);
    revalidatePath('/directory');
    revalidatePath('/family-tree-visualizer');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add members' };
  }
}

/**
 * MEMBER (owner): Update a person that belongs to their household.
 */
export async function updateMyPersonAction(personId: string, data: unknown) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Not authorized' };
  }

  const adminClient = createAdminClient();

  // Verify ownership via household membership or created_by  OR admin override
  const { data: person } = await (adminClient.from('persons') as any).select('id, created_by').eq('id', personId).single();
  const { data: links } = await (adminClient.from('household_members') as any)
    .select('household_id')
    .eq('person_id', personId);

  let owns = person && person.created_by === current.id;
  if (!owns && links?.length) {
    for (const l of links) {
      const { data: hh } = await (adminClient.from('households') as any).select('created_by, owner_profile_id').eq('id', l.household_id).single();
      if (hh && (hh.created_by === current.id || hh.owner_profile_id === current.id)) {
        owns = true; break;
      }
    }
  }
  const isAdmin = current.profile.role === 'admin';
  if (!owns && !isAdmin) return { success: false, error: 'You can only edit people in your own household' };

  const { data: oldP } = await adminClient.from('persons').select('*').eq('id', personId).single();

  const allowed = ['full_name','gender','date_of_birth','date_of_death','is_deceased','education','occupation','marital_status','mobile_number','whatsapp_number','email','blood_group','notes','avatar_url','father_id','mother_id','spouse_id'];
  const updatePayload: any = { updated_by: current.id };
  Object.keys(data as any).forEach(k => { if (allowed.includes(k)) updatePayload[k] = (data as any)[k]; });

  const { data: updated, error } = await (adminClient.from('persons') as any)
    .update(updatePayload)
    .eq('id', personId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'MEMBER_UPDATE_PERSON',
    table_name: 'persons',
    record_id: personId,
    old_data: oldP,
    new_data: updated,
    performed_by: current.id,
  });

  revalidatePath('/directory');
  revalidatePath('/family-tree-visualizer');

  return { success: true };
}

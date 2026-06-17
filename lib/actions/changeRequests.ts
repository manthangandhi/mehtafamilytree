'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { logAudit } from './audit';

/**
 * Fetch all change requests (admin)
 */
export async function getAllChangeRequests(status?: 'pending' | 'approved' | 'rejected') {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  let query = adminClient
    .from('change_requests')
    .select(`
      *,
      submitted_by_profile:profiles!submitted_by (id, full_name, mobile_number),
      reviewed_by_profile:profiles!reviewed_by (id, full_name)
    `)
    .order('submitted_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getAllChangeRequests error', error);
    return [];
  }
  return data ?? [];
}

/**
 * Get single change request with full context (admin)
 */
export async function getChangeRequestById(id: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('change_requests')
    .select(`
      *,
      submitted_by_profile:profiles!submitted_by (id, full_name, mobile_number),
      reviewed_by_profile:profiles!reviewed_by (id, full_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, request: data };
}

/**
 * Member: get own requests
 */
export async function getMyChangeRequests() {
  const current = await getCurrentUserProfile();
  if (!current?.profile) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from('change_requests')
    .select('*')
    .eq('submitted_by', current.id)
    .order('submitted_at', { ascending: false });

  return data ?? [];
}

/**
 * ADMIN: Approve a change request and apply the change to live tables.
 * This is the core of the approval workflow.
 */
export async function approveChangeRequestAction(requestId: string, adminNotes?: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  // Load the request
  const { data: reqRaw, error: reqErr } = await adminClient
    .from('change_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  const req: any = reqRaw;
  if (reqErr || !req) {
    return { success: false, error: 'Request not found' };
  }
  if (req.status !== 'pending') {
    return { success: false, error: 'Request is no longer pending' };
  }

  const proposed = req.proposed_data as any;
  const currentData = req.current_data as any;

  try {
    let appliedRecordId: string | null = req.target_record_id;
    const db: any = adminClient; // bypass for Supabase view/service-role typing (common in this stack)

    switch (req.request_type) {
      case 'add_household': {
        // proposed_data = { household: {...}, members: [...] }
        const h = proposed.household;
        const members: any[] = proposed.members || [];

        // 1. Create primary person (SELF)
        const primary = members.find((m: any) => m.relationship_to_head === 'SELF');
        if (!primary) throw new Error('Primary SELF member missing in proposed data');

        const { data: primaryPerson, error: pErr } = await db
          .from('persons')
          .insert({
            full_name: primary.full_name,
            gender: primary.gender || null,
            date_of_birth: primary.date_of_birth || null,
            date_of_death: primary.date_of_death || null,
            is_deceased: !!primary.is_deceased,
            education: primary.education || null,
            occupation: primary.occupation || null,
            marital_status: primary.marital_status || null,
            mobile_number: primary.mobile_number || null,
            whatsapp_number: primary.whatsapp_number || null,
            email: primary.email || null,
            blood_group: primary.blood_group || null,
            notes: primary.notes || null,
            created_by: req.submitted_by,
          })
          .select()
          .single();

        if (pErr || !primaryPerson) throw pErr || new Error('Primary person creation failed');

        // 2. Create household
        const { data: household, error: hErr } = await db
          .from('households')
          .insert({
            household_code: h.household_code || null,
            primary_member_name: h.primary_member_name,
            primary_person_id: primaryPerson.id,
            native_place: h.native_place || null,
            residence_address: h.residence_address || null,
            business_address: h.business_address || null,
            phone_number: h.phone_number || null,
            mobile_number: h.mobile_number || null,
            whatsapp_number: h.whatsapp_number || null,
            email: h.email || null,
            city: h.city || null,
            state: h.state || null,
            country: h.country || 'India',
            notes: h.notes || null,
            verified: h.verified ?? false,
            visibility_level: h.visibility_level || 'members',
            status: 'active',
            created_by: req.submitted_by,
          })
          .select()
          .single();

        if (hErr || !household) {
          // soft cleanup on rollback
          await (adminClient.from('persons') as any).update({ status: 'inactive' }).eq('id', primaryPerson.id);
          throw hErr || new Error('Household creation failed');
        }

        appliedRecordId = household.id;

        // 3. Insert all household members + persons
        let order = 1;
        let lastWifeId: string | null = null; // Track most recent spouse to correctly link children for "which wife of which son"

        for (const m of members) {
          let personId = m.relationship_to_head === 'SELF' ? primaryPerson.id : null;

          if (m.relationship_to_head !== 'SELF') {
            const { data: newP } = await db
              .from('persons')
              .insert({
                full_name: m.full_name,
                gender: m.gender || null,
                date_of_birth: m.date_of_birth || null,
                date_of_death: m.date_of_death || null,
                is_deceased: !!m.is_deceased,
                education: m.education || null,
                occupation: m.occupation || null,
                marital_status: m.marital_status || null,
                mobile_number: m.mobile_number || null,
                whatsapp_number: m.whatsapp_number || null,
                email: m.email || null,
                blood_group: m.blood_group || null,
                notes: m.notes || null,
                created_by: req.submitted_by,
              })
              .select()
              .single();
            if (newP) personId = newP.id;
          }

          if (personId) {
            await db.from('household_members').insert({
              household_id: household.id,
              person_id: personId,
              relationship_to_head: m.relationship_to_head,
              display_order: order++,
              is_primary: m.relationship_to_head === 'SELF',
            });

            // Create basic relationships (same as direct admin creation for consistency)
            // Track last wife and link children to mother for proper family branch identification
            if (['WIFE', 'HUSBAND'].includes(m.relationship_to_head)) {
              lastWifeId = personId;
              await db.from('relationships').insert([
                {
                  person_id: primaryPerson.id,
                  related_person_id: personId,
                  relationship_type: 'spouse',
                  created_by: req.submitted_by,
                },
                {
                  person_id: personId,
                  related_person_id: primaryPerson.id,
                  relationship_type: 'spouse',
                  created_by: req.submitted_by,
                },
              ]);
            }

            if (['SON', 'DAUGHTER'].includes(m.relationship_to_head)) {
              // Link to head
              await db.from('relationships').insert({
                person_id: primaryPerson.id,
                related_person_id: personId,
                relationship_type: 'child',
                created_by: req.submitted_by,
              });
              // Link to most recent wife (mother) if present in the submitted list order
              if (lastWifeId) {
                await db.from('relationships').insert([
                  {
                    person_id: lastWifeId,
                    related_person_id: personId,
                    relationship_type: 'child',
                    created_by: req.submitted_by,
                  },
                  {
                    person_id: personId,
                    related_person_id: lastWifeId,
                    relationship_type: 'mother',
                    created_by: req.submitted_by,
                  },
                ]);
              }
            }
          }
        }

        await logAudit({
          action_type: 'APPROVE_ADD_HOUSEHOLD',
          table_name: 'households',
          record_id: household.id,
          new_data: { household_id: household.id, submitted_by: req.submitted_by },
          performed_by: current.id,
          notes: adminNotes || 'Member submitted new household approved',
        });
        break;
      }

      case 'update_household': {
        if (!req.target_record_id) throw new Error('Missing target_record_id');
        const { data: oldH } = await db.from('households').select('*').eq('id', req.target_record_id).single();

        const { error: upErr } = await db
          .from('households')
          .update({
            ...proposed,
            updated_by: current.id,
          })
          .eq('id', req.target_record_id);

        if (upErr) throw upErr;

        appliedRecordId = req.target_record_id;

        await logAudit({
          action_type: 'APPROVE_UPDATE_HOUSEHOLD',
          table_name: 'households',
          record_id: req.target_record_id,
          old_data: oldH,
          new_data: proposed,
          performed_by: current.id,
        });
        break;
      }

      case 'update_person': {
        if (!req.target_record_id) throw new Error('Missing target_record_id');
        const { data: oldP } = await db.from('persons').select('*').eq('id', req.target_record_id).single();

        const { error } = await db
          .from('persons')
          .update({ ...proposed, updated_by: current.id })
          .eq('id', req.target_record_id);

        if (error) throw error;

        appliedRecordId = req.target_record_id;

        await logAudit({
          action_type: 'APPROVE_UPDATE_PERSON',
          table_name: 'persons',
          record_id: req.target_record_id,
          old_data: oldP,
          new_data: proposed,
          performed_by: current.id,
        });
        break;
      }

      case 'mark_deceased': {
        if (!req.target_record_id) throw new Error('Missing target_record_id');
        const { data: oldP } = await db.from('persons').select('*').eq('id', req.target_record_id).single();

        const { error } = await db
          .from('persons')
          .update({
            is_deceased: true,
            date_of_death: proposed.date_of_death,
            notes: proposed.notes ? `${oldP?.notes || ''}\n[Deceased note] ${proposed.notes}`.trim() : oldP?.notes,
            updated_by: current.id,
          })
          .eq('id', req.target_record_id);

        if (error) throw error;

        appliedRecordId = req.target_record_id;

        await logAudit({
          action_type: 'APPROVE_MARK_DECEASED',
          table_name: 'persons',
          record_id: req.target_record_id,
          old_data: oldP,
          new_data: proposed,
          performed_by: current.id,
        });
        break;
      }

      case 'delete_household': {
        if (!req.target_record_id) throw new Error('Missing target_record_id');
        await db.from('household_members').delete().eq('household_id', req.target_record_id);
        const { error: delErr } = await db.from('households').delete().eq('id', req.target_record_id);
        if (delErr) throw delErr;

        await logAudit({
          action_type: 'APPROVE_DELETE_HOUSEHOLD',
          table_name: 'households',
          record_id: req.target_record_id,
          performed_by: current.id,
          notes: adminNotes || 'Delete household approved',
        });
        break;
      }

      case 'delete_person': {
        if (!req.target_record_id) throw new Error('Missing target_record_id');
        await db.from('household_members').delete().eq('person_id', req.target_record_id);
        await db.from('relationships').delete().or(`person_id.eq.${req.target_record_id},related_person_id.eq.${req.target_record_id}`);
        await db.from('households').update({ primary_person_id: null }).eq('primary_person_id', req.target_record_id);
        const { error: delErr } = await db.from('persons').delete().eq('id', req.target_record_id);
        if (delErr) throw delErr;

        await logAudit({
          action_type: 'APPROVE_DELETE_PERSON',
          table_name: 'persons',
          record_id: req.target_record_id,
          performed_by: current.id,
          notes: adminNotes || 'Delete person approved',
        });
        break;
      }

      // Core request types are handled; others can be extended similarly if needed.
      default:
        throw new Error(`Approval handler not implemented for request_type: ${req.request_type}`);
    }

    // Mark request approved
    await db
      .from('change_requests')
      .update({
        status: 'approved',
        reviewed_by: current.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || req.admin_notes,
      })
      .eq('id', requestId);

    await logAudit({
      action_type: 'APPROVE_CHANGE_REQUEST',
      table_name: 'change_requests',
      record_id: requestId,
      performed_by: current.id,
      notes: `Approved ${req.request_type}`,
    });

    revalidatePath('/admin/requests');
    revalidatePath('/admin/households');
    revalidatePath('/directory');
    revalidatePath('/my-requests');

    return { success: true, appliedRecordId };
  } catch (err: any) {
    console.error('approveChangeRequestAction failed', err);
    return { success: false, error: err.message || 'Failed to apply change' };
  }
}

/**
 * ADMIN: Reject a change request
 */
export async function rejectChangeRequestAction(requestId: string, rejectionReason: string, adminNotes?: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();
  const db: any = adminClient;

  const { data: reqRaw } = await db
    .from('change_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  const req: any = reqRaw;

  if (!req || req.status !== 'pending') {
    return { success: false, error: 'Invalid or already processed request' };
  }

  const { error } = await db
    .from('change_requests')
    .update({
      status: 'rejected',
      reviewed_by: current.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      admin_notes: adminNotes || req.admin_notes,
    })
    .eq('id', requestId);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'REJECT_CHANGE_REQUEST',
    table_name: 'change_requests',
    record_id: requestId,
    old_data: { status: 'pending' },
    new_data: { status: 'rejected', reason: rejectionReason },
    performed_by: current.id,
  });

  revalidatePath('/admin/requests');
  revalidatePath('/my-requests');

  return { success: true };
}

/**
 * MEMBER: Submit a correction (update_household or update_person)
 */
export async function submitCorrectionRequestAction(params: {
  target_table: 'households' | 'persons';
  target_record_id: string;
  current_data: Record<string, any>;
  proposed_data: Record<string, any>;
}) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Approved members only' };
  }

  const supabase = await createClient();

  const request_type = params.target_table === 'households' ? 'update_household' : 'update_person';

  const { error } = await (supabase.from('change_requests') as any).insert({
    request_type,
    target_table: params.target_table,
    target_record_id: params.target_record_id,
    submitted_by: current.id,
    status: 'pending',
    proposed_data: params.proposed_data,
    current_data: params.current_data,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/my-requests');
  return { success: true };
}

/**
 * MEMBER: Submit mark deceased request
 */
export async function submitMarkDeceasedRequestAction(personId: string, date_of_death: string, notes?: string) {
  const current = await getCurrentUserProfile();
  if (!current?.profile || current.profile.status !== 'approved') {
    return { success: false, error: 'Approved members only' };
  }

  const supabase = await createClient();

  // Fetch current for snapshot
  const { data: personRaw } = await supabase.from('persons').select('*').eq('id', personId).single();
  const person: any = personRaw;

  const { error } = await (supabase.from('change_requests') as any).insert({
    request_type: 'mark_deceased',
    target_table: 'persons',
    target_record_id: personId,
    submitted_by: current.id,
    status: 'pending',
    proposed_data: { date_of_death, notes: notes || '' },
    current_data: person ? { is_deceased: person.is_deceased, date_of_death: person.date_of_death } : null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/my-requests');
  return { success: true };
}

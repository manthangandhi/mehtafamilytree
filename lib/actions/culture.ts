'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { culturalPageSchema } from '@/lib/validations/culture';
import { logAudit } from './audit';

/**
 * Public + member readable cultural pages (filtered by visibility)
 */
export async function getCulturalPages(visibilityFor: 'public' | 'member' = 'public') {
  const supabase = await createClient();

  let query = supabase
    .from('cultural_pages')
    .select('id, title, language, visibility_level, created_at')
    .order('created_at', { ascending: true });

  if (visibilityFor === 'public') {
    query = query.eq('visibility_level', 'public');
  } else {
    // members + public
    query = query.in('visibility_level', ['public', 'members']);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getCulturalPageById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('cultural_pages').select('*').eq('id', id).single();
  return data;
}

/**
 * Admin list (all)
 */
export async function getAllCulturalPagesAdmin() {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { data } = await adminClient
    .from('cultural_pages')
    .select('*')
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function createCulturalPageAction(data: unknown) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const parsed = culturalPageSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Validation failed', issues: parsed.error.issues };
  }

  const { error } = await (adminClient.from('cultural_pages') as any).insert({
    ...parsed.data,
    created_by: current.id,
    updated_by: current.id,
  });

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'CREATE_CULTURAL_PAGE',
    table_name: 'cultural_pages',
    performed_by: current.id,
  });

  revalidatePath('/culture');
  revalidatePath('/admin/culture');

  return { success: true };
}

export async function updateCulturalPageAction(id: string, data: unknown) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const parsed = culturalPageSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid data' };

  const { error } = await (adminClient.from('cultural_pages') as any)
    .update({ ...parsed.data, updated_by: current.id })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'UPDATE_CULTURAL_PAGE',
    table_name: 'cultural_pages',
    record_id: id,
    performed_by: current.id,
  });

  revalidatePath('/culture');
  revalidatePath(`/culture/${id}`);
  revalidatePath('/admin/culture');

  return { success: true };
}

export async function deleteCulturalPageAction(id: string) {
  const current = await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient.from('cultural_pages').delete().eq('id', id);

  if (error) return { success: false, error: error.message };

  await logAudit({
    action_type: 'DELETE_CULTURAL_PAGE',
    table_name: 'cultural_pages',
    record_id: id,
    performed_by: current.id,
  });

  revalidatePath('/culture');
  revalidatePath('/admin/culture');

  return { success: true };
}

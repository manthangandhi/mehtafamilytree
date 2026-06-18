'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { logAudit } from '@/lib/actions/audit';
import { revalidatePath } from 'next/cache';

async function broadcastLifeEventNotification(adminClient: any, announcement: any, adminId: string) {
  // Fetch all approved members
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id')
    .eq('status', 'approved');

  if (!profiles || profiles.length === 0) return;

  const typeMap: Record<string, string> = {
    birth: 'birth',
    marriage: 'marriage',
    death: 'death',
    passing: 'death',
    reunion: 'announcement',
    general: 'general',
  };
  const notifType = typeMap[announcement.event_type] || 'general';

  const inserts = profiles.map((p: any) => ({
    recipient_id: p.id,
    title: announcement.title,
    content: announcement.content?.slice(0, 280) || '',
    type: notifType,
    related_table: 'announcements',
    related_id: announcement.id,
  }));

  await adminClient.from('notifications').insert(inserts);
}

export async function createAnnouncement(formData: FormData) {
  try {
    const adminUser = await requireAdmin();
    const adminClient = createAdminClient();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const event_type = formData.get('event_type') as string;
    const event_date_str = formData.get('event_date') as string;
    const event_date = event_date_str && event_date_str.trim() !== '' ? event_date_str : null;

    const newAnnouncement = {
      title,
      content,
      event_type,
      event_date,
      created_by: adminUser.id,
    };

    const { data, error } = await (adminClient.from('announcements') as any)
      .insert([newAnnouncement])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating announcement:', error);
      throw new Error('Failed to create announcement: ' + error.message);
    }

    await logAudit({
      action_type: 'ADMIN_CREATE_ANNOUNCEMENT',
      table_name: 'announcements',
      record_id: data.id,
      new_data: data,
      performed_by: adminUser.id,
    });

    // Broadcast in-app notifications to approved users (segmented push future)
    try {
      await broadcastLifeEventNotification(adminClient, data, adminUser.id);
    } catch (e) {
      console.warn('Notification broadcast failed (non-fatal)', e);
    }

    revalidatePath('/announcements');
    revalidatePath('/dashboard');
    revalidatePath('/admin/announcements');
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Error in createAnnouncement:', err);
    throw err;
  }
}

export async function updateAnnouncement(id: string, formData: FormData) {
  try {
    const adminUser = await requireAdmin();
    const adminClient = createAdminClient();

    const { data: oldData } = await adminClient
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldData) throw new Error('Announcement not found');

    const event_date_str = formData.get('event_date') as string;
    const event_date = event_date_str && event_date_str.trim() !== '' ? event_date_str : null;

    const updates = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      event_type: formData.get('event_type') as string,
      event_date,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (adminClient.from('announcements') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating announcement:', error);
      throw new Error('Failed to update announcement: ' + error.message);
    }

    await logAudit({
      action_type: 'ADMIN_UPDATE_ANNOUNCEMENT',
      table_name: 'announcements',
      record_id: id,
      old_data: oldData,
      new_data: data,
      performed_by: adminUser.id,
    });

    revalidatePath('/announcements');
    revalidatePath('/dashboard');
    revalidatePath('/admin/announcements');
    
    return { success: true, data };
  } catch (err: any) {
    console.error('Error in updateAnnouncement:', err);
    throw err;
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const adminUser = await requireAdmin();
    const adminClient = createAdminClient();

    const { data: oldData } = await adminClient
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldData) throw new Error('Announcement not found');

    const { error } = await (adminClient.from('announcements') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting announcement:', error);
      throw new Error('Failed to delete announcement: ' + error.message);
    }

    await logAudit({
      action_type: 'ADMIN_DELETE_ANNOUNCEMENT',
      table_name: 'announcements',
      record_id: id,
      old_data: oldData,
      performed_by: adminUser.id,
    });

    revalidatePath('/announcements');
    revalidatePath('/dashboard');
    revalidatePath('/admin/announcements');
    return { success: true };
  } catch (err: any) {
    console.error('Error in deleteAnnouncement:', err);
    throw err;
  }
}

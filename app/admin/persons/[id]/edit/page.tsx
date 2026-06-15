import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/actions/audit';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function EditPerson({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();
  const { data: p } = await admin.from('persons').select('*').eq('id', id).single();
  if (!p) notFound();
  const person = p as any;

  async function save(formData: FormData) {
    'use server';
    const updates: any = {
      full_name: formData.get('full_name'),
      education: formData.get('education') || null,
      occupation: formData.get('occupation') || null,
      avatar_url: formData.get('avatar_url') || null,
      notes: formData.get('notes') || null,
      is_deceased: formData.get('is_deceased') === 'on',
    };
    const adminClient = createAdminClient();
    const current = await requireAdmin();
    const { data: oldP } = await adminClient.from('persons').select('*').eq('id', id).single();
    await (adminClient.from('persons') as any).update(updates).eq('id', id);

    await logAudit({
      action_type: 'ADMIN_UPDATE_PERSON',
      table_name: 'persons',
      record_id: id,
      old_data: oldP,
      new_data: updates,
      performed_by: current.id,
    });
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <Link href="/admin/persons">← Persons</Link>
      <h1 className="mt-2 text-xl font-semibold">Edit Person</h1>
      <form action={save} className="mt-6 card space-y-4 p-6">
        <input name="full_name" defaultValue={person.full_name} className="input" placeholder="Full Name" />
        <input name="avatar_url" defaultValue={person.avatar_url || ''} className="input" placeholder="Avatar URL" />
        <input name="education" defaultValue={person.education || ''} className="input" placeholder="Education" />
        <input name="occupation" defaultValue={person.occupation || ''} className="input" placeholder="Occupation" />
        <textarea name="notes" defaultValue={person.notes || ''} className="input min-h-[100px]" placeholder="Notes" />
        <label className="text-sm"><input type="checkbox" name="is_deceased" defaultChecked={person.is_deceased} /> Deceased</label>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/actions/audit';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AddMembersForm } from '../AddMembersForm';
import { deleteHouseholdAdmin } from '@/lib/actions/households';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function EditHousehold({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: hRaw } = await adminClient.from('households').select('*').eq('id', id).single();
  if (!hRaw) notFound();
  const h: any = hRaw;

  async function handleUpdate(formData: FormData) {
    'use server';
    const payload: Record<string, any> = {};
    formData.forEach((v, k) => {
      if (k === 'verified') payload[k] = v === 'on';
      else payload[k] = (v as string) || null;
    });
    const adminC = createAdminClient();
    const current = await requireAdmin();
    const { data: oldH } = await adminC.from('households').select('*').eq('id', id).single();
    await (adminC.from('households') as any)
      .update({ ...payload, updated_by: current.id })
      .eq('id', id);

    await logAudit({
      action_type: 'ADMIN_UPDATE_HOUSEHOLD',
      table_name: 'households',
      record_id: id,
      old_data: oldH,
      new_data: payload,
      performed_by: current.id,
    });
  }

  async function handleDeactivate(formData: FormData) {
    'use server';
    const adminC = createAdminClient();
    const current = await requireAdmin();
    const { data: oldH } = await adminC.from('households').select('*').eq('id', id).single();
    await (adminC.from('households') as any)
      .update({ status: 'inactive', updated_by: current.id })
      .eq('id', id);

    await logAudit({
      action_type: 'ADMIN_DEACTIVATE_HOUSEHOLD',
      table_name: 'households',
      record_id: id,
      old_data: oldH,
      new_data: { status: 'inactive' },
      performed_by: current.id,
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/admin/households" className="text-sm">← Back</Link>
      <h1 className="mt-2 text-2xl font-semibold">Edit Household</h1>

      <form action={handleUpdate} className="mt-6 card space-y-4 p-6">
        <Input name="primary_member_name" label="Primary Name" defaultValue={h.primary_member_name} />
        <Input name="household_code" label="Code" defaultValue={h.household_code || ''} />
        <Input name="city" label="Current City" defaultValue={h.city || ''} />
        <Input name="state" label="State" defaultValue={h.state || ''} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="date" name="anniversary_date" label="Anniversary Date" defaultValue={h.anniversary_date || ''} />
          <div className="text-xs text-muted mt-8">Optional. Date of marriage for the household head.</div>
        </div>

        <Textarea name="residence_address" label="Residence Address" defaultValue={h.residence_address || ''} />
        <Textarea name="notes" label="Notes" defaultValue={h.notes || ''} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="verified" defaultChecked={h.verified} /> Verified
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Save Changes</Button>
          <Button 
            type="submit" 
            formAction={handleDeactivate} 
            variant="secondary"
            className="text-accent hover:text-primary hover:bg-accent/10"
          >
            Deactivate Household
          </Button>
        </div>
      </form>

      <div className="mt-4">
        <DeleteButton
          action={async () => {
            'use server';
            await deleteHouseholdAdmin(id);
          }}
          label="Delete Household"
          confirmMessage="Hard delete this household? This cannot be undone."
          className="text-sm underline text-red-600 hover:text-red-700"
        />
      </div>

      <div className="mt-8">
        <h3 className="section-title mb-2">Add Missed Family Members</h3>
        <p className="text-sm text-muted mb-4">
          If you missed adding some family members when creating this household, add them here. 
          They will be created as new person records and linked to this household.
        </p>
        <AddMembersForm householdId={id} />
      </div>

      <div className="mt-8 text-xs text-muted">
        For editing or removing existing family members, use the person management tools or submit corrections.
      </div>
    </div>
  );
}

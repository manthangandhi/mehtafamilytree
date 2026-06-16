import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import { getHouseholdMembers } from '@/lib/actions/persons';
import { submitCorrectionRequestAction } from '@/lib/actions/changeRequests';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export default async function HouseholdEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const current = await getCurrentUserProfile();

  if (!current || !current.profile || current.profile.status !== 'approved') {
    redirect('/login');
  }

  const supabase = await createClient();

  const { data: householdData } = await supabase
    .from('member_households_view')
    .select('*')
    .eq('id', id)
    .single();

  const household = householdData as any;

  if (!household) notFound();

  const members = await getHouseholdMembers(id);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href={`/households/${id}`} className="text-sm text-muted hover:text-primary">← Back to household</Link>
            <h1 className="font-serif text-4xl font-semibold tracking-tight mt-2">Edit Household &amp; Members</h1>
            <p className="text-muted mt-1">Update details for <span className="font-medium text-foreground">{household.primary_member_name}</span>. Changes are submitted for review and will be applied promptly.</p>
          </div>
        </div>

        {/* Household core info */}
        <form action={async (formData: FormData) => {
          'use server';
          const updates: any = {
            primary_member_name: formData.get('primary_member_name') || undefined,
            city: formData.get('city') || undefined,
            state: formData.get('state') || undefined,
            country: formData.get('country') || undefined,
            native_place: formData.get('native_place') || undefined,
            residence_address: formData.get('residence_address') || undefined,
            mobile_number: formData.get('mobile_number') || undefined,
            whatsapp_number: formData.get('whatsapp_number') || undefined,
            email: formData.get('email') || undefined,
            notes: formData.get('notes') || undefined,
          };

          // Submit as a structured correction for the household
          await submitCorrectionRequestAction({
            target_table: 'households',
            target_record_id: id,
            current_data: household || {},
            proposed_data: updates,
          });

          // Also handle person updates below via separate calls in the client form if needed.
          // For now the main household + we can enhance.
        }} className="card p-8 mb-8">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">Household Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Primary Member / Head Name</label>
              <Input name="primary_member_name" defaultValue={household.primary_member_name} />
            </div>
            <div>
              <label className="label">Native Place / Village</label>
              <Input name="native_place" defaultValue={household.native_place} />
            </div>
            <div>
              <label className="label">City</label>
              <Input name="city" defaultValue={household.city} />
            </div>
            <div>
              <label className="label">State / Province</label>
              <Input name="state" defaultValue={household.state} />
            </div>
            <div>
              <label className="label">Country</label>
              <Input name="country" defaultValue={household.country} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Full Residence Address</label>
              <Input name="residence_address" defaultValue={household.residence_address} />
            </div>
            <div>
              <label className="label">Mobile</label>
              <Input name="mobile_number" defaultValue={household.mobile_number} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <Input name="whatsapp_number" defaultValue={household.whatsapp_number} />
            </div>
            <div>
              <label className="label">Email</label>
              <Input name="email" type="email" defaultValue={household.email} />
            </div>
          </div>

          <div className="mt-5">
            <label className="label">Household Notes</label>
            <Textarea name="notes" defaultValue={household.notes} rows={3} />
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" variant="primary">Save Household Changes</Button>
            <Link href={`/households/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
          <p className="text-[11px] text-muted mt-3">Your updates will be reviewed and applied. You will be notified.</p>
        </form>

        {/* Persons in this household - direct edit cards */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Family Members in this Household</h2>
          <p className="text-sm text-muted mb-4">Update any person below. For complex lineage changes (mother/child/spouse relationships), use the lineage visualiser or contact an admin.</p>
        </div>

        <div className="space-y-6">
          {members.length > 0 ? members.map((m: any, idx: number) => {
            const p = m.person || m;
            return (
              <form key={p.id || idx} action={async (formData: FormData) => {
                'use server';
                const personId = p.id;
                const changes: any = {
                  full_name: formData.get('full_name') || undefined,
                  date_of_birth: formData.get('date_of_birth') || undefined,
                  occupation: formData.get('occupation') || undefined,
                  education: formData.get('education') || undefined,
                  marital_status: formData.get('marital_status') || undefined,
                  blood_group: formData.get('blood_group') || undefined,
                  notes: formData.get('notes') || undefined,
                  mobile_number: formData.get('mobile_number') || undefined,
                };

                await submitCorrectionRequestAction({
                  target_table: 'persons',
                  target_record_id: personId,
                  current_data: p || {},
                  proposed_data: changes,
                });
              }} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-lg">{p.full_name || 'Member'}</div>
                  <div className="text-xs px-2 py-0.5 rounded bg-surface-hover text-muted border">{m.relationship_to_head || 'Member'}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                  <div>
                    <label className="label text-xs">Full Name</label>
                    <Input name="full_name" defaultValue={p.full_name} />
                  </div>
                  <div>
                    <label className="label text-xs">Date of Birth</label>
                    <Input name="date_of_birth" type="date" defaultValue={p.date_of_birth} />
                  </div>
                  <div>
                    <label className="label text-xs">Occupation</label>
                    <Input name="occupation" defaultValue={p.occupation} />
                  </div>
                  <div>
                    <label className="label text-xs">Education</label>
                    <Input name="education" defaultValue={p.education} />
                  </div>
                  <div>
                    <label className="label text-xs">Marital Status</label>
                    <Input name="marital_status" defaultValue={p.marital_status} />
                  </div>
                  <div>
                    <label className="label text-xs">Blood Group</label>
                    <Input name="blood_group" defaultValue={p.blood_group} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label text-xs">Mobile (if different)</label>
                    <Input name="mobile_number" defaultValue={p.mobile_number} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label text-xs">Notes / Additional Info</label>
                    <Textarea name="notes" defaultValue={p.notes} rows={2} />
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button type="submit" variant="primary" className="text-sm py-2">Save Changes for this Person</Button>
                </div>
              </form>
            );
          }) : (
            <div className="text-muted">No detailed member records loaded. Use the Suggest Correction flow for the head of household if needed.</div>
          )}
        </div>

        {/* Add New Family Member - always scoped to this household */}
        <div className="mt-8 card p-8 border border-accent/30">
          <h2 className="font-semibold text-lg mb-2">Add New Family Member to this Household</h2>
          <p className="text-sm text-muted mb-6">This will be submitted as a pending request for admin review. It will be added directly to <span className="font-medium">{household.primary_member_name}</span>'s household.</p>

          <form action={async (formData: FormData) => {
            'use server';
            const supabase = await createClient();
            const userId = current?.profile?.id;

            if (!userId) {
              return;
            }

            const member = {
              full_name: formData.get('full_name') as string,
              relationship_to_head: formData.get('relationship_to_head') as string,
              gender: formData.get('gender') as string || null,
              date_of_birth: formData.get('date_of_birth') as string || null,
              occupation: formData.get('occupation') as string || null,
              education: formData.get('education') as string || null,
              marital_status: formData.get('marital_status') as string || null,
              mobile_number: formData.get('mobile_number') as string || null,
              notes: formData.get('notes') as string || null,
            };

            if (!member.full_name || !member.relationship_to_head) {
              // basic validation; in real would toast but server action limited here
              return;
            }

            await (supabase.from('change_requests') as any).insert({
              request_type: 'add_household_member',
              target_table: 'household_members',
              target_record_id: id,
              submitted_by: userId,
              status: 'pending',
              proposed_data: {
                household_id: id,
                member: member,
              },
              current_data: null,
              notes: `Add new member from household edit page`,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label text-xs">Full Name *</label>
                <Input name="full_name" required placeholder="Full name" />
              </div>
              <div>
                <label className="label text-xs">Relationship to Head *</label>
                <select name="relationship_to_head" required className="input text-sm">
                  <option value="">Select...</option>
                  <option value="WIFE">Wife</option>
                  <option value="HUSBAND">Husband</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="BROTHER">Brother</option>
                  <option value="SISTER">Sister</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Gender</label>
                <select name="gender" className="input text-sm">
                  <option value="">—</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Date of Birth</label>
                <Input name="date_of_birth" type="date" />
              </div>
              <div>
                <label className="label text-xs">Occupation</label>
                <Input name="occupation" />
              </div>
              <div>
                <label className="label text-xs">Education</label>
                <Input name="education" />
              </div>
              <div>
                <label className="label text-xs">Marital Status</label>
                <Input name="marital_status" />
              </div>
              <div>
                <label className="label text-xs">Mobile</label>
                <Input name="mobile_number" />
              </div>
              <div className="md:col-span-3">
                <label className="label text-xs">Notes</label>
                <Textarea name="notes" rows={2} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" className="text-sm">Submit New Member for Review</Button>
              <p className="text-[11px] text-muted self-center">Will be added to this household after admin approval.</p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-xs text-muted">
          For complex relationships (e.g. wife of a child from previous marriage) or bulk adds, use the lineage tools or contact an admin after submitting the basic record.
        </div>
      </div>
    </div>
  );
}

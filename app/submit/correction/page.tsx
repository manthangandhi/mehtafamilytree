'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { submitCorrectionRequestAction } from '@/lib/actions/changeRequests';
import { toast } from 'sonner';

function CorrectionForm() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedHousehold = search.get('household');
  const preselectedName = search.get('name');

  const [targetType, setTargetType] = useState<'household' | 'person'>('household');
  const [targetId, setTargetId] = useState(preselectedHousehold || '');
  const [targetName, setTargetName] = useState(preselectedName || '');
  const [changes, setChanges] = useState({
    full_name: '',
    mobile_number: '',
    whatsapp_number: '',
    email: '',
    city: '',
    state: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) {
      toast.error('Please select a record from the directory to correct.');
      return;
    }

    const proposed: Record<string, any> = {};
    Object.entries(changes).forEach(([k, v]) => {
      if (v.trim()) proposed[k] = v.trim();
    });

    if (Object.keys(proposed).length === 0) {
      toast.error('Please fill in at least one field to correct');
      return;
    }

    setLoading(true);

    const result = await submitCorrectionRequestAction({
      target_table: targetType === 'household' ? 'households' : 'persons',
      target_record_id: targetId,
      current_data: {},
      proposed_data: proposed,
    });

    if (result.success) {
      toast.success('Correction request submitted. Thank you for helping keep our records accurate.');
      router.push('/my-requests');
    } else {
      toast.error(result.error || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-5">
      <div>
        <div className="label mb-1.5">I am correcting a</div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={targetType === 'household'} 
              onChange={() => setTargetType('household')} 
            /> 
            Household
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={targetType === 'person'} 
              onChange={() => setTargetType('person')} 
            /> 
            Person
          </label>
        </div>
      </div>

      {targetName ? (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Target Record</div>
          <div className="font-serif text-lg text-foreground">{targetName}</div>
          <p className="text-xs text-muted mt-1">If you want to correct a different record, please go back to the directory and click "Suggest correction" on their profile.</p>
        </div>
      ) : (
        <Input
          label="Record ID *"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Paste the ID from the directory or household page URL"
          required
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" value={changes.full_name} onChange={e => handleChange('full_name', e.target.value)} />
        <Input label="Mobile" value={changes.mobile_number} onChange={e => handleChange('mobile_number', e.target.value)} placeholder="+91 ..." />
        <Input label="WhatsApp" value={changes.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} />
        <Input label="Email" type="email" value={changes.email} onChange={e => handleChange('email', e.target.value)} />
        <Input label="City" value={changes.city} onChange={e => handleChange('city', e.target.value)} />
        <Input label="State" value={changes.state} onChange={e => handleChange('state', e.target.value)} />
      </div>

      <Textarea 
        label="Other Notes or Additional Changes" 
        value={changes.notes} 
        onChange={e => handleChange('notes', e.target.value)} 
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting Request...' : 'Submit Correction for Admin Review'}
      </Button>

      <p className="text-xs text-center text-primary">
        This will not change anything until an admin reviews and approves it.
      </p>
    </form>
  );
}

export default function SubmitCorrectionPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl">Submit Correction</h1>
        <p className="text-muted mt-2">Suggest updates to an existing household or person record. An admin will review.</p>
      </div>

      <Suspense fallback={<div className="card p-8">Loading form...</div>}>
        <CorrectionForm />
      </Suspense>

      <p className="mt-6 text-sm text-center text-muted">Tip: Open a household detail page and note the ID in the URL to make corrections easier.</p>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { submitCorrectionRequestAction } from '@/lib/actions/changeRequests';
import { toast } from 'sonner';

interface Props {
  initialData?: {
    id?: string;
    full_name?: string | null;
    mobile_number?: string | null;
    whatsapp_number?: string | null;
    email?: string | null;
  };
}

export default function MyProfileForm({ initialData = {} }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    mobile_number: initialData.mobile_number || '',
    whatsapp_number: initialData.whatsapp_number || '',
    email: initialData.email || '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const changes: Record<string, any> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v) changes[k] = v;
    });

    if (Object.keys(changes).length === 0) {
      toast.error('Please fill at least one field to update');
      setLoading(false);
      return;
    }

    const result = await submitCorrectionRequestAction({
      target_table: 'persons',
      target_record_id: initialData.id || '',
      current_data: {},
      proposed_data: { ...changes, _note: 'Self-submitted profile update via My Profile' },
    });

    if (result.success) {
      toast.success('Update request submitted. An admin will review it.');
      router.push('/my-requests');
    } else {
      toast.error(result.error || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="font-serif text-2xl mt-3">My Profile</h1>
      <p className="text-muted mt-1 mb-6">
        Update your own information. This will create a correction request for admin review (changes go live only after approval).
      </p>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <Input 
          label="Full Name" 
          value={formData.full_name} 
          onChange={e => handleChange('full_name', e.target.value)} 
        />
        <Input 
          label="Mobile Number" 
          value={formData.mobile_number} 
          onChange={e => handleChange('mobile_number', e.target.value)} 
          placeholder="+91 ..." 
        />
        <Input 
          label="WhatsApp" 
          value={formData.whatsapp_number} 
          onChange={e => handleChange('whatsapp_number', e.target.value)} 
        />
        <Input 
          label="Email" 
          type="email" 
          value={formData.email} 
          onChange={e => handleChange('email', e.target.value)} 
        />
        <Textarea 
          label="Additional Notes or Other Updates" 
          value={formData.notes} 
          onChange={e => handleChange('notes', e.target.value)} 
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Update for Review'}
        </Button>

        <p className="text-xs text-center text-muted">
          Your changes will not go live until an admin approves them.
        </p>
      </form>
    </div>
  );
}

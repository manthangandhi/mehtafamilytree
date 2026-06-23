'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { FloralBackground } from '@/components/ui/FloralBackground';

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
      if (v !== undefined && v !== '') changes[k] = v;
    });

    if (Object.keys(changes).length === 0) {
      toast.error('Please fill at least one field to update');
      setLoading(false);
      return;
    }

    // Direct update on own profile (RLS allows)
    const supabase = createClient();
    const { error } = await (supabase.from('profiles') as any)
      .update({
        full_name: changes.full_name,
        mobile_number: changes.mobile_number,
      })
      .eq('id', initialData.id);

    if (error) {
      toast.error(error.message || 'Failed to update');
    } else {
      toast.success('Profile updated successfully.');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader
        title="My Profile"
        description="Update your basic profile information"
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      />

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] w-full flex-grow px-6 py-10">
        
        <div className="mx-auto max-w-2xl premium-card p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-full font-bold shadow-md bg-primary hover:bg-primary-hover transition-transform active:scale-95 text-white">
              {loading ? 'Submitting...' : 'Submit Update for Review'}
            </Button>

            <p className="text-xs text-center text-gray-500 font-medium">
              Your changes will not go live until an admin approves them.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

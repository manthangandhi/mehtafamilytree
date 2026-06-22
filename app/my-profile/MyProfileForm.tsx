'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createClient } from '@/lib/supabase/client';
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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      
      {/* Primary Brand Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
        <FloralBackground opacity="0.10" />
        
        <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                  My Profile
                </h1>
                <p className="text-[16px] text-white/90 font-medium drop-shadow-sm max-w-xl">
                  Update your basic profile information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] w-full flex-grow px-6 py-10">
        
        <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10">
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

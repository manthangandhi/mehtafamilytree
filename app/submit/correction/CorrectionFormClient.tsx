'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { submitCorrectionRequestAction } from '@/lib/actions/changeRequests';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';

function InnerCorrectionForm() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedHousehold = search.get('household');

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [householdName, setHouseholdName] = useState('');
  const [members, setMembers] = useState<{id: string, name: string}[]>([]);

  const [targetRecord, setTargetRecord] = useState<string>(''); 
  
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

  useEffect(() => {
    async function fetchHousehold() {
      if (!preselectedHousehold) {
        setLoadingMembers(false);
        return;
      }
      try {
        const supabase = createClient();
        
        const { data: hData } = await supabase.from('households').select('primary_member_name').eq('id', preselectedHousehold).single();
        if (hData) setHouseholdName((hData as any).primary_member_name);

        const { data: mData } = await supabase.from('household_members')
          .select('person_id, persons(full_name)')
          .eq('household_id', preselectedHousehold);
        
        if (mData) {
          const formatted = mData.map((m: any) => ({
            id: m.person_id,
            name: m.persons?.full_name || 'Unknown Member'
          }));
          setMembers(formatted);
        }

        setTargetRecord(`household:${preselectedHousehold}`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchHousehold();
  }, [preselectedHousehold]);

  const handleChange = (field: string, value: string) => {
    setChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRecord) {
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
    
    const [type, id] = targetRecord.split(':');

    const result = await submitCorrectionRequestAction({
      target_table: type === 'household' ? 'households' : 'persons',
      target_record_id: id,
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

  if (loadingMembers && preselectedHousehold) {
    return <div className="p-12 text-center animate-pulse">Loading household data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-8 md:p-10 space-y-6">
      
      {preselectedHousehold ? (
        <div className="p-5 bg-primary/5 rounded-xl border border-primary/20">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Target Record</div>
          
          <label className="block text-sm font-medium text-foreground mb-2">Which record are you correcting?</label>
          <select 
            className="w-full h-11 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={targetRecord}
            onChange={(e) => setTargetRecord(e.target.value)}
            required
          >
            <option value={`household:${preselectedHousehold}`}>Entire Household ({householdName || 'Unknown'})</option>
            {members.map(m => (
              <option key={m.id} value={`person:${m.id}`}>Person: {m.name}</option>
            ))}
          </select>
          
          <p className="text-sm text-muted mt-3">If you want to correct a completely different household, please go back to the households list.</p>
        </div>
      ) : (
        <Input
          label="Record ID *"
          value={targetRecord.split(':')[1] || ''}
          onChange={(e) => setTargetRecord(`household:${e.target.value}`)}
          placeholder="Paste the Household ID here"
          required
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Correct Name" value={changes.full_name} onChange={e => handleChange('full_name', e.target.value)} />
        <Input label="Correct Mobile" value={changes.mobile_number} onChange={e => handleChange('mobile_number', e.target.value)} placeholder="+91 ..." />
        <Input label="Correct WhatsApp" value={changes.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} />
        <Input label="Correct Email" type="email" value={changes.email} onChange={e => handleChange('email', e.target.value)} />
        <Input label="Correct Current City" value={changes.city} onChange={e => handleChange('city', e.target.value)} />
        <Input label="Correct State" value={changes.state} onChange={e => handleChange('state', e.target.value)} />
      </div>

      <Textarea 
        label="Correct Notes / Other Changes" 
        value={changes.notes} 
        onChange={e => handleChange('notes', e.target.value)} 
        placeholder="Provide any other corrections or context here..."
        rows={4}
      />

      <div className="pt-4 flex justify-end gap-3">
        <Link href="/directory">
          <Button type="button" variant="secondary">Cancel</Button>
        </Link>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Submitting...' : 'Submit Correction'}
        </Button>
      </div>
    </form>
  );
}

export default function CorrectionFormClient() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader 
        title="Suggest a Correction"
        description="Notice an error in a family member's details? Submit the correct information below. An administrator will review your changes before they go live."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
        }
      />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-10">
        <div className="premium-card p-8 md:p-10 max-w-2xl mx-auto animate-fade-in">
          <Suspense fallback={<div className="animate-pulse h-64 bg-surface rounded-xl"></div>}>
            <InnerCorrectionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

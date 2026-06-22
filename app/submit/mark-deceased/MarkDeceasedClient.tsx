'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { submitMarkDeceasedRequestAction } from '@/lib/actions/changeRequests';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';

export default function MarkDeceasedClient() {
  const [personId, setPersonId] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !dateOfDeath) {
      toast.error('Person ID and date of death are required');
      return;
    }
    setLoading(true);

    const res = await submitMarkDeceasedRequestAction(personId, dateOfDeath, notes);
    if (res.success) {
      toast.success('Request submitted. Thank you for helping keep the records accurate.');
      router.push('/my-requests');
    } else {
      toast.error(res.error || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHeader 
        title="Mark as Deceased"
        description="This is a sensitive update and requires admin approval."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M7 7h10M5 22h14"/></svg>
        }
      />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-10">
        <div className="premium-card p-8 md:p-10 max-w-2xl mx-auto animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Person Record ID"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              placeholder="UUID from directory"
              required
            />
            <Input
              label="Date of Death"
              type="date"
              value={dateOfDeath}
              onChange={(e) => setDateOfDeath(e.target.value)}
              required
            />
            <Textarea
              label="Additional notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-4 flex justify-end gap-3">
              <Link href="/dashboard">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
            <p className="text-sm text-center text-muted font-medium mt-4">This request will be reviewed carefully by an administrator.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

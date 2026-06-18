'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { submitMarkDeceasedRequestAction } from '@/lib/actions/changeRequests';
import { toast } from 'sonner';

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
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/dashboard" className="text-sm">← Back</Link>
      <h1 className="mt-2 text-2xl font-semibold">Mark a Family Member as Deceased</h1>
      <p className="text-muted mt-2">This is a sensitive update and requires admin approval.</p>

      <form onSubmit={handleSubmit} className="mt-6 card p-8 space-y-5">
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

        <Button type="submit" variant="secondary" disabled={loading} className="text-accent border-accent/30 hover:bg-accent/10">
          {loading ? 'Submitting...' : 'Submit Mark Deceased Request'}
        </Button>
        <p className="text-sm text-foreground font-medium">This request will be reviewed carefully by an administrator.</p>
      </form>
    </div>
  );
}

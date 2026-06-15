'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createCulturalPageAction } from '@/lib/actions/culture';
import { toast } from 'sonner';

export default function NewCulturalPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCulturalPageAction({ title, category, content, visibility_level: visibility });
    if (res.success) {
      toast.success('Page created');
      router.push('/admin/culture');
    } else {
      toast.error(res.error || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/admin/culture">← Back</Link>
      <h1 className="mt-2 text-xl font-semibold">New Cultural Page</h1>
      <form onSubmit={handleSubmit} className="mt-6 card space-y-4 p-6">
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="history">history</option>
            <option value="mataji_instructions">mataji_instructions</option>
            <option value="gotra_guidance">gotra_guidance</option>
            <option value="general">general</option>
            <option value="special_note">special_note</option>
          </select>
          <select className="input" value={visibility} onChange={e=>setVisibility(e.target.value)}>
            <option value="public">public</option>
            <option value="members">members</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <Textarea 
          label="Content (Markdown supported)" 
          value={content} 
          onChange={e=>setContent(e.target.value)} 
          required 
          className="min-h-[260px]" 
        />
        <p className="text-xs text-muted -mt-2">
          Use **bold**, *italic*, - lists, [links](url), etc. Preview available on public view.
        </p>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Page'}</Button>
      </form>
    </div>
  );
}

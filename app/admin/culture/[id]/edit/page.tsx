'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { updateCulturalPageAction, deleteCulturalPageAction } from '@/lib/actions/culture';
import { toast } from 'sonner';

export default function EditCulturalPage({ params }: { params: Promise<{ id: string }> }) {
  // For simplicity we keep state minimal; in real would fetch on server or use client fetch.
  // We use a simplified controlled form and pass ID.
  const [id, setId] = React.useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      const p = await params;
      setId(p.id);
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient();
        const { data } = await (supabase.from('cultural_pages') as any).select('title, content, language').eq('id', p.id).single();
        if (data) {
          setTitle(data.title || '');
          setContent(data.content || '');
          setLanguage(data.language || 'English');
        }
      } catch (e) {
        // keep defaults
      }
    })();
  }, [params]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateCulturalPageAction(id, { title, content, language });
    if (res.success) {
      toast.success('Updated');
      router.push('/admin/culture');
    } else toast.error(res.error);
    setLoading(false);
  };

  const del = async () => {
    if (!confirm('Delete this page?')) return;
    await deleteCulturalPageAction(id);
    router.push('/admin/culture');
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/admin/culture">← All Pages</Link>
      <h1 className="mt-2 text-xl font-semibold">Edit Cultural Page</h1>
      <form onSubmit={save} className="mt-6 space-y-4 card p-6">
        <Input label="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <div>
          <label className="label">Language (for speaker mode)</label>
          <select className="input" value={language} onChange={e=>setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        <Textarea 
          label="Content (Markdown supported)" 
          value={content} 
          onChange={e=>setContent(e.target.value)} 
          className="min-h-[280px]" 
        />
        <p className="text-xs text-muted -mt-2">
          Use **bold**, *italic*, - lists, [links](url). Changes are immediately visible to members/viewers based on visibility.
        </p>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>Save</Button>
          <Button type="button" variant="secondary" onClick={del} className="text-accent hover:text-primary hover:bg-accent/10">Delete</Button>
        </div>
      </form>
    </div>
  );
}

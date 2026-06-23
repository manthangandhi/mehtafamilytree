'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
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
    <div className="p-6 sm:p-8 lg:p-10 max-w-[1100px] mx-auto w-full">
      <div className="mb-6">
        <Link 
          href="/admin/culture" 
          className="inline-flex items-center text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          ← Back to Cultural Pages
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-800">Edit Cultural Page</h1>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="premium-card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <Input 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                className="text-lg py-3" 
              />
            </div>

            <div className="max-w-xs">
              <label className="block text-sm font-semibold text-foreground mb-2">Language</label>
              <select className="input w-full" value={language} onChange={e=>setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Content</label>
              <RichTextEditor 
                value={content} 
                onChange={setContent} 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={del} className="text-red-600 hover:bg-red-50 border-red-200">Delete Page</Button>
        </div>
      </form>
    </div>
  );
}

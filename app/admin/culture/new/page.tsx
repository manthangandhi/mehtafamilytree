'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { createCulturalPageAction } from '@/lib/actions/culture';
import { toast } from 'sonner';

export default function NewCulturalPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCulturalPageAction({ title, content, visibility_level: visibility, language });
    if (res.success) {
      toast.success('Page created');
      router.push('/admin/culture');
    } else {
      toast.error(res.error || 'Failed');
    }
    setLoading(false);
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

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-800">New Cultural Page</h1>
          <p className="text-muted mt-1">Create a new story, history, or guidance page for the family archive.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. The History of Our Gotra" 
                required 
                className="text-lg py-3"
              />
            </div>

            {/* Visibility Row */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Visibility</label>
              <select 
                className="input w-full" 
                value={visibility} 
                onChange={e => setVisibility(e.target.value)}
              >
                <option value="public">Public (anyone)</option>
                <option value="members">Members only</option>
                <option value="admin">Admins only</option>
              </select>
            </div>

            {/* Language */}
            <div className="max-w-xs">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Language <span className="text-muted font-normal">(affects speaker / voice)</span>
              </label>
              <select 
                className="input w-full" 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* Rich Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Content
              </label>
              <RichTextEditor 
                value={content} 
                onChange={setContent} 
                placeholder="Begin writing the story, instructions, or history here. Use the toolbar above for rich formatting."
              />
              <p className="text-xs text-muted mt-2">
                Use the toolbar for formatting. Your content will appear beautifully formatted on the public site.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={loading || !title.trim() || !content.trim()} 
            className="px-8 py-2.5 text-base"
          >
            {loading ? 'Creating Page...' : 'Create Page'}
          </Button>
        </div>
      </form>
    </div>
  );
}

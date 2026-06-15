import { requireAdmin } from '@/lib/auth/requireAdmin';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { createAnnouncement } from '@/lib/actions/announcements';
import { redirect } from 'next/navigation';

export default async function NewAnnouncement() {
  await requireAdmin();

  async function handleSubmit(formData: FormData) {
    'use server';
    await createAnnouncement(formData);
    redirect('/admin/announcements');
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 animate-fade-in">
      <Link href="/admin/announcements" className="text-sm font-medium text-muted hover:text-primary transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Announcements
      </Link>
      
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">Create Announcement</h1>
        <p className="text-muted mt-2">Publish news, events, or updates to the family.</p>
      </div>

      <form action={handleSubmit} className="bg-surface rounded-[2rem] rounded-tr-lg rounded-bl-lg border border-border/50 p-8 space-y-6 shadow-[0_10px_40px_-15px_rgba(141,79,17,0.1)]">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Title</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
            placeholder="e.g. Annual Family Reunion 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Event Type</label>
          <select name="event_type" required className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
            <option value="general">General Announcement</option>
            <option value="birth">Birth</option>
            <option value="marriage">Marriage</option>
            <option value="passing">Passing</option>
            <option value="reunion">Family Reunion</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Event Date (Optional)</label>
          <input 
            type="date" 
            name="event_date" 
            className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
          />
          <p className="text-xs text-muted mt-2">If this relates to a specific date.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Content / Details</label>
          <textarea 
            name="content" 
            required 
            className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[160px] resize-y" 
            placeholder="Provide all the details here..."
          />
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-border/50 mt-6">
          <Link href="/admin/announcements" className="px-6 py-3 font-sans text-sm font-semibold tracking-wide rounded-full text-muted hover:bg-surface transition-colors inline-flex items-center justify-center">
            Cancel
          </Link>
          <button type="submit" className="bg-primary text-white shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-px inline-flex items-center justify-center px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide">
            Publish Announcement
          </button>
        </div>
      </form>
    </div>
  );
}

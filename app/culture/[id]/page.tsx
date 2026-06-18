import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCulturalPageById } from '@/lib/actions/culture';
import { marked } from 'marked';
import { SpeakerButton } from '@/components/culture/SpeakerButton';

export default async function CultureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page: any = await getCulturalPageById(id);

  if (!page) notFound();

  // Render Markdown safely (admins are trusted for family content)
  const htmlContent = marked.parse(page.content || '') as string;
  const lang = page.language || 'English';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/culture" className="inline-flex items-center font-medium text-primary hover:underline mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Culture &amp; History
        </Link>
        <div className="animate-fade-in flex items-start justify-between gap-4">
          <div>
            <h1 className="text-primary font-serif">{page.title}</h1>
            <div className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
              {page.category} <span className="opacity-50">·</span> {lang}
            </div>
          </div>
          <SpeakerButton content={page.content || ''} language={lang} title={page.title} />
        </div>

        <article 
          className="prose-heritage mt-8 max-w-none leading-relaxed text-foreground animate-fade-in delay-1 bg-surface rounded-3xl p-8 md:p-12 border border-border/50"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-10 border-t border-border pt-6 text-muted">
          This content is part of our living family archive. Admins can format using Markdown. Use the speaker button above to listen (language-aware).
        </div>
      </div>
    </div>
  );
}

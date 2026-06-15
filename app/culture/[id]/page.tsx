import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCulturalPageById } from '@/lib/actions/culture';
import { marked } from 'marked';

export default async function CultureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page: any = await getCulturalPageById(id);

  if (!page) notFound();

  // Render Markdown safely (admins are trusted for family content)
  const htmlContent = marked.parse(page.content || '') as string;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/culture" className="inline-flex items-center font-medium text-primary hover:underline mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Culture &amp; History
        </Link>
        <div className="animate-fade-in">
          <h1 className="text-primary font-serif">{page.title}</h1>
          <div className="mt-2 text-muted uppercase tracking-wider">{page.category} &middot; {page.language}</div>
        </div>

        <article 
          className="prose prose-zinc mt-8 max-w-none leading-relaxed text-foreground animate-fade-in delay-1 bg-surface rounded-3xl p-8 md:p-12 border border-border/50"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-10 border-t border-border pt-6 text-muted">
          This content is part of our living family archive. Admins can format using Markdown.
        </div>
      </div>
    </div>
  );
}

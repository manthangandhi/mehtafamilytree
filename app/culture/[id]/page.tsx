import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCulturalPageById } from '@/lib/actions/culture';
import { marked } from 'marked';
import { SpeakerButton } from '@/components/culture/SpeakerButton';
import { FloralBackground } from '@/components/ui/FloralBackground';

export default async function CultureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page: any = await getCulturalPageById(id);

  if (!page) notFound();

  // Support both old Markdown content and new rich HTML content
  const raw = page.content || '';
  const htmlContent = raw.trim().startsWith('<') 
    ? raw 
    : marked.parse(raw) as string;
  const lang = page.language || 'English';

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Green edge-to-edge header — matching directory + household details */}
      <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
        <FloralBackground opacity="0.10" />
        
        <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
          {/* Back link */}
          <div className="-mt-2 mb-3">
            <Link href="/culture" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white font-medium">
              ← Back to Culture &amp; History
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Book icon to match culture list page */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                </svg>
              </div>
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                  {page.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    {lang}
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker button in header for prominence */}
            <div className="mt-4 md:mt-0">
              <SpeakerButton 
                content={page.content || ''} 
                language={lang} 
                title={page.title}
                // Force light button for dark green header contrast (matches directory submit style)
                className="bg-white text-primary hover:bg-gray-50 border-white/20 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content below green header — consistent container + styling */}
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 w-full flex-grow py-8">
        <article 
          className="prose-heritage max-w-none leading-relaxed text-foreground animate-fade-in bg-surface rounded-3xl p-8 md:p-12 border border-border/70 premium-card"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-8 text-sm text-muted max-w-2xl">
          This content is part of our living family archive. 
          Use the speaker button to listen (language-aware).
        </div>
      </div>

      {/* Subtle footer note for consistency with other pages */}
      <div className="bg-amber-50/70 py-5 border-t border-amber-100 mt-auto">
        <p className="text-center text-sm text-amber-800 font-medium px-6">
          Preserving our heritage — one story at a time.
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getCulturalPages } from '@/lib/actions/culture';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import Image from 'next/image';

export default async function CultureIndex() {
  const current = await getCurrentUserProfile();
  const isApproved = current?.profile?.status === 'approved';
  const pages = await getCulturalPages(isApproved ? 'member' : 'public');

  return (
    <>
      {/* Entire page background with tree image - adjusted transparency for readability (as recommended) */}
      <div 
        className="relative min-h-screen pt-24 pb-16 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/hero-tree.png')" }}
      >
        {/* Overlay using proper z stacking (z-0) and theme var, no inline style. Full coverage via inset-0 on relative parent. */}
        <div className="absolute inset-0 z-0 bg-background/90"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column - Context */}
            <div className="lg:w-1/3">
              <div className="sticky top-32 animate-fade-in">
                <h1 className="font-serif text-[42px] leading-[1.1] font-bold text-foreground mb-4">Our Family Culture &amp; History.</h1>
                <p className="text-[17px] text-muted leading-relaxed mb-8">
                  Explore the stories, traditions, and collective wisdom passed down through generations. These sacred documents form the foundation of our heritage.
                </p>
              </div>
            </div>
            
            {/* Right Column - Cards */}
            <div className="lg:w-2/3">
              <div className="grid gap-5 animate-fade-in delay-1">
                {pages.map((p: any) => (
                  <Link key={p.id} href={`/culture/${p.id}`} className="premium-card p-8 group flex items-center justify-between hover:border-accent/40 transition-all hover:shadow-md">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                      <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
                        <span className="text-accent">{p.category}</span>
                        <span>&middot;</span>
                        <span>{p.language}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </Link>
                ))}
                {pages.length === 0 && (
                  <div className="text-center py-20 premium-card">
                     <h3 className="font-serif text-2xl font-bold text-foreground">No public pages published yet.</h3>
                     <p className="mt-2 text-muted">Check back later for new historical documents.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Quote section integrated into the same background container for full page tree bg. 
            Uses family-section for consistency. Strengthened card shadow + text-shadow. 
            Opacity tested at 10% for tree (was 12-15%), overlay /90 for good text visibility vs subtle tree motif. 
            Added mt-12 for breathing room between the main content (cards grid) and the quote card. */}
        <div className="relative border-t border-border/60 bg-surface/98 overflow-hidden py-16 mt-12 family-section">
          <div className="absolute inset-0">
            <Image 
              src="/images/hero-tree.png" 
              alt="Heritage tree" 
              fill
              className="object-cover opacity-10" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/98 to-background" />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="bg-surface p-8 md:p-10 rounded-2xl shadow-md border border-border/50">
              <p 
                className="font-serif text-3xl md:text-[42px] leading-tight italic text-foreground tracking-[-0.01em]"
                style={{ textShadow: '0 3px 12px rgba(0,0,0,0.4)' }}
              >
                “A family's history is an anchor in the storm.”
              </p>
              <div className="mt-4 text-sm uppercase tracking-[3px] text-muted">— The Elders of the Mehta Kutumb</div>
              <div className="mt-6 text-sm text-muted max-w-sm mx-auto">
                These documents and the stories within them are our living connection to every generation that came before.
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

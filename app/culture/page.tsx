import Link from 'next/link';
import { getCulturalPages } from '@/lib/actions/culture';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';

export default async function CultureIndex() {
  const current = await getCurrentUserProfile();
  const isApproved = current?.profile?.status === 'approved';
  const pages = await getCulturalPages(isApproved ? 'member' : 'public');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface">
      <div className="mx-auto max-w-6xl px-6">
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Context */}
          <div className="lg:w-1/3">
            <div className="sticky top-32 animate-fade-in">
              <h1 className="font-serif text-[42px] leading-[1.1] font-bold text-foreground mb-4">Our Family Culture &amp; History.</h1>
              <p className="text-[17px] text-muted leading-relaxed mb-8">
                Explore the stories, traditions, and collective wisdom passed down through generations. These sacred documents form the foundation of our heritage.
              </p>
              <div className="relative h-44 w-full rounded-3xl border border-border/60 overflow-hidden bg-surface flex items-center justify-center p-5 text-center">
                <img src="/images/hero-tree.png" alt="Heritage" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                <p className="relative font-serif text-lg italic text-foreground">"A family's history is an anchor in the storm."</p>
              </div>
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
    </div>
  );
}

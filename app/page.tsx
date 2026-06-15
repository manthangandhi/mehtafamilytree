import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HouseholdCard } from '@/components/directory/HouseholdCard';

export default async function Home() {
  // Fetch live public household data for the homepage teaser cards
  const supabase = await createClient();
  const { data: households } = await supabase
    .from('public_households_view')
    .select('*')
    .eq('status', 'active')
    .order('primary_member_name')
    .limit(4);

  return (
    <>
      {/* Hero with BACKGROUND image (newly generated heritage tree bg) */}
      <div className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden pt-8 pb-12">
        {/* Background layer - the elegant wide heritage image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        {/* Warm, readable overlay scrim (light parchment tint + gradient for depth + subtle vignette) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f3eb]/65 via-[#f7f3eb]/82 to-[#f7f3eb]/96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(247,243,235,0.35)_75%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-surface/90 border border-border text-[11px] font-semibold tracking-[0.3em] text-muted mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            EST. LATE 1800s • RAJASTHAN ROOTS • ONE KUTUMB
          </div>

          <h1 className="font-serif text-[52px] leading-[1.02] md:text-[72px] md:leading-[0.96] font-bold tracking-[-0.035em] text-foreground mb-6">
            Mehta Kutumb.<br />One family.<br />A thousand stories.
          </h1>

          <p className="max-w-2xl mx-auto text-[18px] md:text-[20px] leading-relaxed text-foreground/80 mb-10">
            A living private archive of our people — across continents, generations and households.<br />
            Honouring where we came from. Staying connected wherever life has taken us.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/directory" className="btn btn-primary px-10 py-3.5 text-base shadow-lg">
              Explore Our Households
            </Link>
            <Link href="/family-tree-visualizer" className="btn btn-secondary px-10 py-3.5 text-base">
              Trace the Lineage
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted tracking-[1.5px]">PRIVATE • APPROVED MEMBERS ONLY • BUILT FOR THE MEHTA FAMILY</p>
        </div>

        {/* Subtle decorative use of the original tree image as a small elegant mark */}
        <div className="absolute bottom-8 right-8 hidden lg:block opacity-40">
          <img src="/images/hero-tree.png" alt="" className="w-20 h-20 object-contain" />
        </div>
      </div>

      {/* Legacy Stats Bar — proud representative numbers for the real family */}
      <div className="border-y border-border/70 bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="stat-card">
              <div className="font-serif text-[42px] font-bold text-primary tracking-tighter">3,000+</div>
              <div className="text-sm font-semibold text-muted tracking-widest mt-1">FAMILY MEMBERS</div>
            </div>
            <div className="stat-card">
              <div className="font-serif text-[42px] font-bold text-primary tracking-tighter">12+</div>
              <div className="text-sm font-semibold text-muted tracking-widest mt-1">HOUSEHOLDS</div>
            </div>
            <div className="stat-card">
              <div className="font-serif text-[42px] font-bold text-primary tracking-tighter">5</div>
              <div className="text-sm font-semibold text-muted tracking-widest mt-1">COUNTRIES</div>
            </div>
            <div className="stat-card">
              <div className="font-serif text-[42px] font-bold text-primary tracking-tighter">8</div>
              <div className="text-sm font-semibold text-muted tracking-widest mt-1">GENERATIONS</div>
            </div>
          </div>
          <p className="text-center text-[13px] text-muted mt-4">One family. Many homes. Forever connected.</p>
        </div>
      </div>

      {/* LIVE CARDS — actual households from the database (public view) */}
      <div className="family-section py-16">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-2">THE LIVING KUTUMB</div>
          <h2 className="page-title">Our Households</h2>
          <p className="mt-3 text-muted max-w-md mx-auto">A small glimpse of the homes that make up our one big family. Every record is part of the same story.</p>
        </div>

        {households && households.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {households.map((h: any) => (
              <HouseholdCard key={h.id} household={h} isApproved={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted">No households published yet. Check back soon.</div>
        )}

        <div className="text-center mt-8">
          <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            View the complete directory of households →
          </Link>
        </div>
      </div>

      {/* Rich Features Section — kept for depth and storytelling */}
      <div className="family-section py-12 border-t border-border/60">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">WHAT WE HOLD DEAR</div>
          <h2 className="page-title">Our Family, Preserved</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-9 flex flex-col group">
            <div className="mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/></svg>
              </div>
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">One Unified Kutumb</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              Whether you live in the ancestral village, Mumbai, the US, UK, Canada or Australia — we are still one family. 
              This is the digital thread that binds every household.
            </p>
            <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              Browse every household <span className="ml-1.5">→</span>
            </Link>
          </div>

          <div className="card p-9 flex flex-col group overflow-hidden">
            <div className="mb-8 -mx-2 -mt-2">
              <img src="/images/hero-tree.png" alt="Family tree detail" className="w-24 h-24 rounded-2xl object-contain opacity-90" />
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">Interactive Lineage</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              See how we are connected. Mothers, fathers, wives, children across households. 
              Follow the branches that left home and the roots that stayed.
            </p>
            <Link href="/family-tree-visualizer" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              Open the family visualiser <span className="ml-1.5">→</span>
            </Link>
          </div>

          <div className="card p-9 flex flex-col group">
            <div className="mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              </div>
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">Living Heritage &amp; Stories</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              Rituals, recipes, village tales, and the wisdom of our elders — preserved in their own words. 
              A place for the next generation to truly know us.
            </p>
            <Link href="/culture" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              Discover our culture &amp; history <span className="ml-1.5">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy + Trust band */}
      <div className="bg-surface border-y border-border/70">
        <div className="family-section py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="font-serif text-2xl font-semibold">Privacy is sacred here.</div>
            <p className="text-muted mt-1 max-w-md">Only approved members of the Mehta Kutumb can see full contact details, family links, and personal records.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/privacy-policy" className="btn btn-secondary text-sm">Read our privacy promise</Link>
            <Link href="/register" className="btn btn-primary text-sm">Request access</Link>
          </div>
        </div>
      </div>

      {/* Final warm CTA */}
      <div className="family-section py-16 text-center">
        <p className="text-muted mb-3 text-sm tracking-widest">WELCOME HOME</p>
        <h3 className="font-serif text-[32px] md:text-[40px] leading-tight font-semibold tracking-tight mb-6">This is more than a directory.<br />It is our family, together again.</h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/directory" className="btn btn-primary px-10 py-3.5 text-base">Begin exploring the households</Link>
          <Link href="/family-tree-visualizer" className="btn btn-secondary px-10 py-3.5 text-base">See how we are connected</Link>
        </div>
        <p className="mt-8 text-xs text-muted">Made with love for every Mehta, wherever you call home.</p>
      </div>
    </>
  );
}

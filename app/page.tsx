import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
// Note: HouseholdCard import kept as-is (no changes to KPI/tagline section per instructions)
import Image from 'next/image';

export default async function Home() {
  const supabase = await createClient();

  // Live KPI stats for the section below hero (as requested)
  const { count: householdCount } = await supabase
    .from('public_households_view')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: personCount } = await supabase
    .from('public_persons_view')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: livingCount } = await supabase
    .from('public_persons_view')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('is_deceased', false);

  const { data: countriesRaw } = await supabase
    .from('public_households_view')
    .select('country')
    .eq('status', 'active')
    .not('country', 'is', null);

  const countriesCount = new Set(
    (countriesRaw || []).map((h: any) => h.country).filter(Boolean)
  ).size;

  return (
    <>
      {/* Preload key images for performance (hero background and tree fallback) */}
      {/* Consider switching to next/image + priority for hero-bg/hero-tree in future for automatic optimization/preload (no design change needed) */}
      <link rel="preload" href="/images/hero-bg.jpg" as="image" />
      <link rel="preload" href="/images/hero-tree.png" as="image" />

      {/* Hero with BACKGROUND image (the awesome version you liked - image directly as background for the hero section) */}
      {/* Adjusted pt-0 so layout's pt-24 (for fixed header) provides the hero-only top space. */}
      <div
        className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden pt-0 pb-12"
      >
        {/* Hero background image faded via opacity so text is visible (not vibrant). Change this opacity value to adjust how faded the image is. */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/hero-bg.jpg')", opacity: 0.35 }} 
        />

        {/* Subtle dark vignette for depth - kept minimal */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/2 via-black/3 to-black/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.03)_80%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-surface/90 border border-border text-[11px] font-semibold tracking-[0.3em] text-muted mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            EST. LATE 1800s • RAJASTHAN ROOTS • ONE KUTUMB
          </div>

          <h1 className="font-serif text-[52px] leading-[1.02] md:text-[72px] md:leading-[0.96] font-bold tracking-[-0.035em] text-foreground mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            Mehta Kutumb.<br />One family.<br />A thousand stories.
          </h1>

          <p className="max-w-2xl mx-auto text-[18px] md:text-[20px] leading-relaxed text-foreground/80 mb-10 drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
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

          <p className="mt-6 text-xs text-muted tracking-[1.5px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]">PRIVATE • APPROVED MEMBERS ONLY • BUILT FOR THE MEHTA FAMILY</p>
        </div>
      </div>

      {/* Family Tagline (as requested) */}
      <div className="py-8 text-center bg-surface border-b border-border/70">
        <p className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
          One family. Many homes. Forever connected.
        </p>
      </div>

      {/* LIVE KPI STATS (the section below the hero - totals for persons, households etc.) */}
      <div className="family-section py-14">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-1">THE MEHTA KUTUMB TODAY</div>
          <h2 className="page-title">Our Family at a Glance</h2>
          <p className="mt-2 text-muted">Live numbers from our shared records.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{householdCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">HOUSEHOLDS</div>
            <div className="text-[11px] text-muted mt-0.5">Active family homes</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{personCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">FAMILY MEMBERS</div>
            <div className="text-[11px] text-muted mt-0.5">Recorded in the Kutumb</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{livingCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">LIVING TODAY</div>
            <div className="text-[11px] text-muted mt-0.5">Current generation carriers</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{countriesCount}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">COUNTRIES</div>
            <div className="text-[11px] text-muted mt-0.5">Our branches span the world</div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-muted">These numbers grow as our family contributes and records are lovingly maintained.</p>
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
              <Image src="/images/hero-tree.png" alt="Family tree detail" width={96} height={96} className="w-24 h-24 rounded-2xl object-contain opacity-90" />
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

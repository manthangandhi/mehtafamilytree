import { createClient } from '@/lib/supabase/server';
import { TranslatedLanding } from './TranslatedLanding';

export default async function Home() {
  const supabase = await createClient();

  // Live KPI stats - wrapped defensively so a missing view/RLS/column never causes Internal Server Error
  let householdCount: number | null = null;
  let personCount: number | null = null;
  let livingCount: number | null = null;
  let countriesCount = 0;

  try {
    const { count: hCount } = await supabase
      .from('public_households_view')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    householdCount = hCount ?? null;

    const { count: pCount } = await supabase
      .from('public_persons_view')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    personCount = pCount ?? null;

    const { count: lCount } = await supabase
      .from('public_persons_view')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_deceased', false);
    livingCount = lCount ?? null;

    const { data: countriesRaw } = await supabase
      .from('public_households_view')
      .select('country')
      .eq('status', 'active')
      .not('country', 'is', null);

    countriesCount = new Set(
      (countriesRaw || []).map((h: any) => h.country).filter(Boolean)
    ).size;
  } catch (e) {
    // Never let stats queries crash the landing page
    console.warn('Home stats fetch failed (non-fatal):', e);
  }

  return (
    <>
      {/* Preload key images */}
      <link rel="preload" href="/images/hero-bg.jpg" as="image" />
      <link rel="preload" href="/images/hero-tree.png" as="image" />

      <TranslatedLanding 
        householdCount={householdCount} 
        personCount={personCount} 
        livingCount={livingCount} 
        countriesCount={countriesCount} 
      />
    </>
  );
}

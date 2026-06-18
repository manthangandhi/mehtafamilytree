'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function TranslatedLanding({ householdCount, personCount, livingCount, countriesCount }: {
  householdCount: number | null;
  personCount: number | null;
  livingCount: number | null;
  countriesCount: number;
}) {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <div className="relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden pt-0 pb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/images/hero-bg.jpg')", opacity: 0.35 }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/2 via-black/3 to-black/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.03)_80%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-surface/90 border border-border text-[11px] font-semibold tracking-[0.3em] text-muted mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            {t('heroTagline')}
          </div>

          <h1 className="font-serif text-[52px] leading-[1.02] md:text-[72px] md:leading-[0.96] font-bold tracking-[-0.035em] text-foreground mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] whitespace-pre-line">
            {t('heroTitle')}
          </h1>

          <p className="max-w-2xl mx-auto text-[18px] md:text-[20px] leading-relaxed text-foreground/80 mb-10 drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)] whitespace-pre-line">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/directory" className="btn btn-primary px-10 py-3.5 text-base shadow-lg">
              {t('exploreHouseholds')}
            </Link>
            <Link href="/family-tree-visualizer" className="btn btn-secondary px-10 py-3.5 text-base">
              {t('traceLineage')}
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted tracking-[1.5px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]">{t('privateNote')}</p>
        </div>
      </div>

      {/* Tagline */}
      <div className="py-8 text-center bg-surface border-b border-border/70">
        <p className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
          {t('tagline')}
        </p>
      </div>

      {/* LIVE KPI STATS */}
      <div className="family-section py-14">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-1">{t('familyAtGlance')}</div>
          <h2 className="page-title">{t('familyAtGlance')}</h2>
          <p className="mt-2 text-muted">{t('liveNumbers')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{householdCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">{t('householdsLabel')}</div>
            <div className="text-[11px] text-muted mt-0.5">{t('householdsDesc')}</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{personCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">{t('membersLabel')}</div>
            <div className="text-[11px] text-muted mt-0.5">{t('membersDesc')}</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{livingCount ?? '—'}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">{t('livingLabel')}</div>
            <div className="text-[11px] text-muted mt-0.5">{t('livingDesc')}</div>
          </div>
          <div className="stat-card py-7">
            <div className="font-serif text-5xl font-bold text-primary tracking-tighter">{countriesCount}</div>
            <div className="mt-1 text-sm font-semibold text-muted tracking-[1.5px]">{t('countriesLabel')}</div>
            <div className="text-[11px] text-muted mt-0.5">{t('countriesDesc')}</div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-muted">{t('numbersNote')}</p>
      </div>

      {/* Features - simplified translated version */}
      <div className="family-section py-12 border-t border-border/60">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">{t('whatWeHold')}</div>
          <h2 className="page-title">{t('familyPreserved')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-9 flex flex-col group">
            <div className="mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/></svg>
              </div>
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">{t('unifiedTitle')}</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              {t('unifiedDesc')}
            </p>
            <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              {t('browseHouseholds')}
            </Link>
          </div>

          <div className="card p-9 flex flex-col group">
            <div className="mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
              </div>
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">{t('richHistoryTitle')}</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              {t('richHistoryDesc')}
            </p>
            <Link href="/culture" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              {t('exploreCulture')}
            </Link>
          </div>

          <div className="card p-9 flex flex-col group">
            <div className="mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-inset ring-border/60">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
            </div>
            <h3 className="font-serif text-3xl font-semibold tracking-tight mb-4">{t('privacyTitle')}</h3>
            <p className="text-[15px] leading-relaxed text-muted mb-8 flex-1">
              {t('privacyDesc')}
            </p>
            <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
              {t('viewDirectory')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

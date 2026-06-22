'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FloralBackground } from '@/components/ui/FloralBackground';

interface Props {
  isApproved: boolean;
}

export function TranslatedDirectoryHeader({ isApproved }: Props) {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
      <FloralBackground opacity="0.10" />
      
      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                {t('directoryTitle')}
              </h1>
              <p className="text-[16px] text-white/90 font-medium drop-shadow-sm max-w-xl">
                {isApproved ? t('fullDetails') : t('publicView')}
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-widest text-white/60 font-bold drop-shadow-sm">
                {t('oneFamilyNote')}
              </p>
            </div>
          </div>
          
          {isApproved && (
            <Link href="/submit/new-household" className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 border border-transparent shadow-lg px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              {t('submitNew')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

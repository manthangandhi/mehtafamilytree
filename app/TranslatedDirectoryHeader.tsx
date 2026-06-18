'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  isApproved: boolean;
}

export function TranslatedDirectoryHeader({ isApproved }: Props) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex h-11 w-11 flex-shrink-0 mt-1 rounded-2xl bg-primary/5 text-primary items-center justify-center border border-border/60">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div>
          <h1 className="font-serif text-[36px] leading-[1.05] font-semibold text-foreground tracking-[-0.02em]">{t('directoryTitle')}</h1>
          <p className="mt-1.5 text-[15px] text-muted max-w-xl">
            {isApproved ? t('fullDetails') : t('publicView')}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted/80">{t('oneFamilyNote')}</p>
        </div>
      </div>
      {isApproved && (
        <Link href="/submit/new-household">
          <Button variant="secondary" className="text-sm py-2.5 px-6 border border-border/50 bg-surface hover:bg-surface-hover shadow-sm whitespace-nowrap">
            {t('submitNew')}
          </Button>
        </Link>
      )}
    </div>
  );
}

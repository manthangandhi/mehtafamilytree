'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FloralBackground } from '@/components/ui/FloralBackground';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-gradient-to-r from-primary via-[#114536] to-primary text-[#f7f3eb] border-t border-[#f7f3eb]/20 relative overflow-hidden">
      <FloralBackground opacity="0.10" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-10 pb-8">
        {/* Upper section: Logo + description + links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 gap-x-8">
          {/* Brand column */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-3 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none" className="h-8 w-8 transition-transform group-hover:scale-105">
                <path d="M24 51 L19 57" stroke="#f7f3eb" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M32 51 L32 57" stroke="#f7f3eb" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M40 51 L45 57" stroke="#f7f3eb" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="32" y1="49" x2="32" y2="20" stroke="#f7f3eb" strokeWidth="2" strokeLinecap="round" />
                <circle cx="32" cy="15" r="3.5" fill="#C8A97E" stroke="#f7f3eb" strokeWidth="1" />
                <path d="M32 22 Q 19 27 14 33" stroke="#f7f3eb" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M32 22 Q 45 27 50 33" stroke="#f7f3eb" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <circle cx="14" cy="34" r="3" fill="#C8A97E" stroke="#f7f3eb" strokeWidth="1" />
                <circle cx="50" cy="34" r="3" fill="#C8A97E" stroke="#f7f3eb" strokeWidth="1" />
              </svg>
              <span className="font-serif font-semibold text-2xl text-[#f7f3eb]">Mehta Kutumb</span>
            </Link>
            <p className="mt-3 text-sm text-[#f7f3eb]/70 max-w-[260px]">
              {t('livingArchive') || 'The living archive of the Mehta family — one kutumb, many generations, forever connected.'}
            </p>
          </div>

          {/* Links columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-8 text-sm">
              {/* Explore */}
              <div>
                <div className="font-medium text-[#f7f3eb]/90 mb-3 tracking-wide">Explore</div>
                <div className="space-y-2">
                  <Link href="/directory" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">{t('households')}</Link>
                  <Link href="/family-tree-visualizer" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">{t('tree')}</Link>
                  <Link href="/culture" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">{t('culture')}</Link>
                </div>
              </div>

              {/* Community */}
              <div>
                <div className="font-medium text-[#f7f3eb]/90 mb-3 tracking-wide">Community</div>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">{t('dashboard')}</Link>
                  <Link href="/my-profile" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">My Profile</Link>
                </div>
              </div>

              {/* Legal */}
              <div>
                <div className="font-medium text-[#f7f3eb]/90 mb-3 tracking-wide">Legal</div>
                <div className="space-y-2">
                  <Link href="/privacy-policy" className="block text-[#f7f3eb]/80 hover:text-[#C8A97E] transition-colors">{t('privacyPolicy')}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#f7f3eb]/15 flex flex-col md:flex-row items-center justify-between gap-y-3 text-xs text-[#f7f3eb]/70">
          <div>
            &copy; {new Date().getFullYear()} Mehta Kutumb. {t('allRights')}
          </div>
          <div className="flex items-center gap-4">
            <span>Built with love for our family</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

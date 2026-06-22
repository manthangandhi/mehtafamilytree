"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import { GoogleTranslate } from "@/components/ui/GoogleTranslate";
import { useLanguage, type Lang } from "@/lib/i18n/LanguageContext";

export function AppHeader() {
  const { lang, setLang, t } = useLanguage();
  const [userState, setUserState] = useState<{
    name: string | null;
    isAdmin: boolean;
    isApproved: boolean;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async (currentUser?: any) => {
      let user = currentUser;
      if (!user) {
        const { data: { user: fetchedUser } } = await supabase.auth.getUser();
        user = fetchedUser;
      }
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role, status")
          .eq("id", user.id)
          .single();

        const profile = data as any;

        setUserState({
          name: profile?.full_name || user.email?.split("@")[0] || "User",
          isAdmin: profile?.role === "admin",
          isApproved: profile?.status === "approved",
        });
      } else {
        setUserState(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        fetchUser(session?.user);
      } else if (event === 'SIGNED_OUT') {
        setUserState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initials = userState?.name?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 glass-header border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64" fill="none" className="h-8 w-8 transition-transform duration-300 group-hover:scale-105">
            {/* Deep roots — heritage & lineage */}
            <path d="M24 51 L19 57" stroke="#0B2E24" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M32 51 L32 57" stroke="#0B2E24" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M40 51 L45 57" stroke="#0B2E24" strokeWidth="1.6" strokeLinecap="round" />
            {/* Strong central trunk */}
            <line x1="32" y1="49" x2="32" y2="20" stroke="#0B2E24" strokeWidth="2.15" strokeLinecap="round" />
            {/* Founding ancestor */}
            <circle cx="32" cy="15" r="4.1" fill="#C8A97E" stroke="#0B2E24" strokeWidth="1.35" />
            {/* First generation branches (children) */}
            <path d="M32 22 Q 19 27 14 33" stroke="#0B2E24" strokeWidth="1.9" strokeLinecap="round" fill="none" />
            <path d="M32 22 Q 45 27 50 33" stroke="#0B2E24" strokeWidth="1.9" strokeLinecap="round" fill="none" />
            <circle cx="14" cy="34" r="3.5" fill="#C8A97E" stroke="#0B2E24" strokeWidth="1.2" />
            <circle cx="50" cy="34" r="3.5" fill="#C8A97E" stroke="#0B2E24" strokeWidth="1.2" />
            {/* Next generation — continuing lineage */}
            <path d="M14 37 Q 7 42 5 48" stroke="#0B2E24" strokeWidth="1.65" strokeLinecap="round" fill="none" />
            <path d="M14 37 Q 17 43 19 48" stroke="#0B2E24" strokeWidth="1.65" strokeLinecap="round" fill="none" />
            <path d="M50 37 Q 57 42 59 48" stroke="#0B2E24" strokeWidth="1.65" strokeLinecap="round" fill="none" />
            <path d="M50 37 Q 47 43 45 48" stroke="#0B2E24" strokeWidth="1.65" strokeLinecap="round" fill="none" />
            {/* Youngest leaves — future branches of the family */}
            <circle cx="5" cy="49" r="2.15" fill="#C8A97E" stroke="#0B2E24" strokeWidth="0.95" />
            <circle cx="19" cy="49" r="2.15" fill="#C8A97E" stroke="#0B2E24" strokeWidth="0.95" />
            <circle cx="59" cy="49" r="2.15" fill="#C8A97E" stroke="#0B2E24" strokeWidth="0.95" />
            <circle cx="45" cy="49" r="2.15" fill="#C8A97E" stroke="#0B2E24" strokeWidth="0.95" />
          </svg>
          <span className="font-serif font-bold text-xl tracking-tight hidden sm:block text-foreground">
            Mehta Kutumb
          </span>
        </Link>

        {/* Desktop Nav - Centered */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-6">
          <Link href="/directory" className="text-sm font-medium text-muted hover:text-primary transition-all hover:underline underline-offset-4 decoration-accent/50">
            {t('households')}
          </Link>
          <Link href="/family-tree-visualizer" className="text-sm font-medium text-muted hover:text-primary transition-all hover:underline underline-offset-4 decoration-accent/50">
            {t('tree')}
          </Link>
          <Link href="/culture" className="text-sm font-medium text-muted hover:text-primary transition-all hover:underline underline-offset-4 decoration-accent/50">
            {t('culture')}
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-primary transition-all hover:underline underline-offset-4 decoration-accent/50">
            {t('dashboard')}
          </Link>
          {userState?.isAdmin && (
            <Link href="/admin" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity hover:underline underline-offset-4 decoration-accent">
              {t('admin')}
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {userState ? (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/my-profile"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-surface border border-border text-[10px] font-bold tracking-widest text-primary transition-all hover:bg-surface-hover shadow-sm"
                title="My Profile"
              >
                {initials}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-xs font-medium text-muted hover:text-accent transition-colors">
                  {t('signOut')}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex btn btn-primary h-9 px-4 text-xs"
            >
              {t('signIn')}
            </Link>
          )}

          {/* Google Translate Widget */}
          <div className="hidden sm:flex">
            <GoogleTranslate />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-foreground transition-all active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop for tap outside to close */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:hidden" 
            style={{ top: '56px' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 z-50 bg-surface border-b border-border shadow-xl md:hidden animate-fade-in">
            <nav className="flex flex-col p-4 gap-2 text-base">
              <Link href="/directory" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-foreground hover:text-primary">{t('households')}</Link>
              <Link href="/family-tree-visualizer" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-foreground hover:text-primary">{t('tree')}</Link>
              <Link href="/culture" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-foreground hover:text-primary">{t('culture')}</Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-foreground hover:text-primary">{t('dashboard')}</Link>
              {userState?.isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-primary">{t('admin')}</Link>
              )}
              <div className="my-1 border-t border-border" />
              <div className="flex gap-1 text-xs py-1">
                <GoogleTranslate />
              </div>
              {userState ? (
                <>
                  <Link href="/my-profile" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-muted hover:text-primary">{t('myProfile')}</Link>
                  <form action="/api/auth/signout" method="POST">
                    <button type="submit" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-left font-serif font-medium text-accent hover:text-primary">{t('signOut')}</button>
                  </form>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-1.5 font-serif font-medium text-foreground hover:text-primary">{t('signIn')}</Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

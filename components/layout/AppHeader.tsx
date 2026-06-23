"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import { GoogleTranslate } from "@/components/ui/GoogleTranslate";
import { useLanguage, type Lang } from "@/lib/i18n/LanguageContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

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
        <Link href="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
          <BrandLogo />
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

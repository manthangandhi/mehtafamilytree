"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";

export function AppHeader() {
  const [userState, setUserState] = useState<{
    name: string | null;
    isAdmin: boolean;
    isApproved: boolean;
  } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const initials = userState?.name?.substring(0, 2).toUpperCase() || "US";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-header ${
        isScrolled ? "py-4 shadow-sm" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" fill="none" className="h-16 w-16 transition-transform duration-300 group-hover:scale-105">
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
          <span className="font-serif font-bold text-2xl tracking-tight hidden sm:block text-foreground">
            Mehta Kutumb
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/directory" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Households
          </Link>
          <Link href="/family-tree-visualizer" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Interactive Tree
          </Link>
          <Link href="/culture" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Culture
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Dashboard
          </Link>
          {userState?.isAdmin && (
            <Link href="/admin" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">
              Admin
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {userState ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/my-profile"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-surface border border-border text-xs font-bold tracking-widest text-primary transition-all hover:bg-surface-hover shadow-sm"
                title="My Profile"
              >
                {initials}
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="text-xs font-bold text-muted hover:text-accent transition-colors uppercase tracking-wider">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex btn btn-primary"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground transition-all active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-2xl md:hidden animate-fade-in origin-top">
          <nav className="flex flex-col p-6 gap-4">
            <Link href="/directory" className="text-lg font-serif font-bold text-foreground">Households</Link>
            <Link href="/family-tree-visualizer" className="text-lg font-serif font-bold text-foreground">Interactive Tree</Link>
            <Link href="/culture" className="text-lg font-serif font-bold text-foreground">Culture</Link>
            <Link href="/dashboard" className="text-lg font-serif font-bold text-foreground">Dashboard</Link>
            {userState?.isAdmin && (
              <Link href="/admin" className="text-lg font-serif font-bold text-primary">Admin</Link>
            )}
            <hr className="border-border my-2" />
            {userState ? (
              <>
                <Link href="/my-profile" className="text-lg font-serif font-medium text-muted">My Profile</Link>
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="text-lg font-serif font-medium text-accent w-full text-left">Sign Out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="text-lg font-serif font-medium text-foreground">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

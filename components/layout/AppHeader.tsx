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
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
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
      }
    };
    fetchUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5" />
              <path d="M11 6V3a1 1 0 0 0-1-1H7.5" />
              <path d="M12 12H3" />
              <path d="M18 12h3" />
              <path d="M12 12v9" />
              <path d="M12 12L3 3" />
              <path d="m12 12 9-9" />
            </svg>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight hidden sm:block text-foreground">
            Directory.
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/directory" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Directory
          </Link>
          <Link href="/family-tree" className="text-sm font-medium text-muted hover:text-primary transition-colors">
            Family Tree
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
            <Link
              href="/my-profile"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold tracking-widest text-primary transition-all hover:bg-surface-hover shadow-sm"
            >
              {initials}
            </Link>
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
            <Link href="/directory" className="text-lg font-serif font-bold text-foreground">Directory</Link>
            <Link href="/family-tree" className="text-lg font-serif font-bold text-foreground">Family Tree</Link>
            <Link href="/culture" className="text-lg font-serif font-bold text-foreground">Culture</Link>
            <Link href="/dashboard" className="text-lg font-serif font-bold text-foreground">Dashboard</Link>
            {userState?.isAdmin && (
              <Link href="/admin" className="text-lg font-serif font-bold text-primary">Admin</Link>
            )}
            <hr className="border-border my-2" />
            {userState ? (
              <Link href="/my-profile" className="text-lg font-serif font-medium text-muted">My Profile</Link>
            ) : (
              <Link href="/login" className="text-lg font-serif font-medium text-foreground">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5" />
                <path d="M11 6V3a1 1 0 0 0-1-1H7.5" />
                <path d="M12 12H3" />
                <path d="M18 12h3" />
                <path d="M12 12v9" />
                <path d="M12 12L3 3" />
                <path d="m12 12 9-9" />
              </svg>
            </div>
            <span className="font-serif font-bold tracking-tight">Directory.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted">
            <Link href="/directory" className="hover:text-foreground transition-colors">Directory</Link>
            <Link href="/family-tree" className="hover:text-foreground transition-colors">Family Tree</Link>
            <Link href="/culture" className="hover:text-foreground transition-colors">Culture</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </nav>
        </div>
        <div className="mt-12 flex justify-between border-t border-border/50 pt-8 text-xs text-muted">
          <p>© {new Date().getFullYear()} Digital Family Directory. All rights reserved.</p>
          <p>Privacy First.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-surface/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-transform group-hover:-rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/></svg>
              </div>
              <span className="font-serif font-bold text-lg text-foreground">Mehta Kutumb</span>
            </Link>
            <p className="text-xs text-muted max-w-xs text-center md:text-left">
              The living archive of the Mehta Kutumb. One family, many branches, forever connected.
            </p>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-3">
            <Link href="/directory" className="text-sm font-medium text-muted hover:text-primary transition-colors">Households</Link>
            <Link href="/family-tree-visualizer" className="text-sm font-medium text-muted hover:text-primary transition-colors">Interactive Tree</Link>
            <Link href="/culture" className="text-sm font-medium text-muted hover:text-primary transition-colors">Heritage</Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">Dashboard</Link>
          </nav>
        </div>
        
        <div className="mt-10 border-t border-stone-200/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Mehta Kutumb. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <span>Restricted Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

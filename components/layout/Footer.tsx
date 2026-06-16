import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 64 64" fill="none" className="h-10 w-10 transition-transform duration-300 group-hover:scale-105">
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
        
        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Mehta Kutumb. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <span>Restricted Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

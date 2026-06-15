'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/households', label: 'Households' },
  { href: '/admin/persons', label: 'Persons' },
  { href: '/admin/requests', label: 'Change Requests' },
  { href: '/admin/culture', label: 'Cultural Pages' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border/50 bg-surface/70 backdrop-blur-xl p-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="mb-6 px-3 text-xs font-bold uppercase tracking-widest text-muted">
        Admin Panel
      </div>
      <nav className="space-y-1.5 text-[15px] font-medium">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin' && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-xl px-3 py-2 transition-all duration-200 ${
                active 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-muted hover:bg-surface/80 hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <div className="my-6 border-t border-border/50" />
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-muted hover:bg-surface/80 hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
      </nav>
    </aside>
  );
}

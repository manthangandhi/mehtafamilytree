'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Home, User, FileText, BookOpen, Megaphone, ListChecks } from 'lucide-react';

import { FloralBackground } from '@/components/ui/FloralBackground';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/households', label: 'Households', icon: Home },
  { href: '/admin/persons', label: 'Persons', icon: User },
  { href: '/admin/requests', label: 'Change Requests', icon: FileText },
  { href: '/admin/culture', label: 'Cultural Pages', icon: BookOpen },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ListChecks },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-gradient-to-b from-primary via-[#114536] to-primary text-white sticky top-0 h-screen overflow-y-auto relative shadow-2xl z-20">
      <FloralBackground opacity="0.08" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <span className="font-serif font-bold tracking-wide text-lg drop-shadow-sm">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 text-[14px] font-medium">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/admin' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                  active 
                    ? 'bg-white text-primary shadow-md font-bold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <l.icon size={18} className={active ? 'text-primary' : 'opacity-80'} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 rounded-xl w-full py-3 bg-white/10 text-white hover:bg-white/20 transition-all shadow-sm font-semibold text-sm backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </aside>
  );
}

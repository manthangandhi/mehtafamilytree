import Link from 'next/link';
import { getCulturalPages } from '@/lib/actions/culture';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import Image from 'next/image';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function CultureIndex() {
  const current = await getCurrentUserProfile();
  const isApproved = current?.profile?.status === 'approved';
  const pages = await getCulturalPages(isApproved ? 'member' : 'public');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      <PageHeader
        title="Our Family Culture & History"
        description="Explore the stories, traditions, and collective wisdom passed down through generations. These sacred documents form the foundation of our heritage."
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>}
      />

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] w-full flex-grow px-6 py-10">
        <div className="premium-card p-8 md:p-10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {pages.map((p: any) => (
              <Link key={p.id} href={`/culture/${p.id}`} className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-8 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
                
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors pr-8">{p.title}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest mt-auto pt-4">
                  <span>{p.language}</span>
                </div>
              </Link>
            ))}
            {pages.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No historical documents found"
                  description="There are currently no published cultural pages or historical documents available. Please check back later as the elders update our archives."
                />
              </div>
            )}
          </div>
        </div>
        {/* Quote section integrated into the vibrant theme */}
        <div className="max-w-4xl mx-auto px-6 text-center mt-12 pb-12">
          <div className="premium-card p-8 md:p-12 border-amber-100">
            <p className="font-serif text-3xl md:text-[42px] leading-tight italic text-primary">
              “A family's history is an anchor in the storm.”
            </p>
            <div className="mt-6 text-sm font-bold uppercase tracking-[3px] text-amber-600">— The Elders of the Mehta Kutumb</div>
            <div className="mt-4 text-sm text-gray-500 font-medium max-w-sm mx-auto">
              These documents and the stories within them are our living connection to every generation that came before.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

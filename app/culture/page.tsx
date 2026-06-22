import Link from 'next/link';
import { getCulturalPages } from '@/lib/actions/culture';
import { getCurrentUserProfile } from '@/lib/auth/getCurrentUserProfile';
import Image from 'next/image';
import { FloralBackground } from '@/components/ui/FloralBackground';

export default async function CultureIndex() {
  const current = await getCurrentUserProfile();
  const isApproved = current?.profile?.status === 'approved';
  const pages = await getCulturalPages(isApproved ? 'member' : 'public');

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
      
      {/* Primary Brand Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#114536] to-primary text-white shadow-md relative overflow-hidden">
        <FloralBackground opacity="0.10" />
        
        <div className="mx-auto max-w-[95%] xl:max-w-[1400px] px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xl border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md">
                  Our Family Culture & History
                </h1>
                <p className="text-[16px] text-white/90 font-medium drop-shadow-sm max-w-2xl">
                  Explore the stories, traditions, and collective wisdom passed down through generations. These sacred documents form the foundation of our heritage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[95%] xl:max-w-[1400px] w-full flex-grow px-6 py-10">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 mb-12">
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
              <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                 <h3 className="font-serif text-2xl font-bold text-gray-800">No public pages published yet.</h3>
                 <p className="mt-2 text-gray-500">Check back later for new historical documents.</p>
              </div>
            )}
          </div>
        </div>
        {/* Quote section integrated into the vibrant theme */}
        <div className="max-w-4xl mx-auto px-6 text-center mt-12 pb-12">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100">
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="max-w-7xl mx-auto bg-stone-900 text-white rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-bold mb-2">Your Privacy Matters</h3>
          <p className="text-sm text-stone-300 leading-relaxed">
            We use essential cookies to ensure the security of your family's data. We do not track you or sell your data to third parties. By continuing to use Mehta Kutumb, you agree to our <Link href="/privacy-policy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800" onClick={accept}>
            Acknowledge
          </Button>
          <Button className="bg-accent text-white hover:bg-accent/90" onClick={accept}>
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

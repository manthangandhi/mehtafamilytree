'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Image from 'next/image';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { BrandLoader } from '@/components/ui/BrandLoader';

function LoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get('redirectedFrom') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message || '';
      setError(msg);

      // Special helpful message for the most common blocker
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('not confirmed')) {
        setError(t('emailNotConfirmed'));
      }

      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first, then click Resend.');
      return;
    }
    setResending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Confirmation email resent! Check your inbox and spam folder.');
    }
    setResending(false);
  };

  return (
    <form onSubmit={handleLogin} className="premium-card p-8 md:p-10 space-y-6">
      <Input
        label={t('emailLabel')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label={t('passwordLabel')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      {error && (
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-sm text-accent">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('signingIn') : t('signInBtn')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendConfirmation}
          disabled={resending || !email}
          className="text-sm text-foreground font-medium hover:text-primary underline underline-offset-2 disabled:opacity-50 transition-colors"
        >
          {resending ? 'Resending...' : t('resendConfirmation')}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="absolute top-8 left-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>
        </div>

        <div className="w-full max-w-sm animate-fade-in mt-12 lg:mt-0">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-[15px] font-medium text-muted">Sign in to access your family hub</p>
          </div>

          <Suspense fallback={<BrandLoader />}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-[15px] font-medium text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover underline underline-offset-4 decoration-accent/50 font-bold transition-all">Create one here</Link>
          </p>
        </div>
      </div>

      {/* Right Hero Side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary overflow-hidden">
        <Image 
          src="/images/auth-hero.png" 
          alt="Mehta Kutumb Heritage" 
          fill 
          className="object-cover opacity-90 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16">
          <h2 className="font-serif text-4xl text-white font-bold mb-4 drop-shadow-md">The Living Archive</h2>
          <p className="text-white/80 text-lg max-w-md font-medium leading-relaxed">
            One kutumb, many generations, forever connected. Log in to explore the rich history, lineages, and stories of the Mehta family.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

function LoginForm() {
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
        setError('Email not confirmed yet. Please check your inbox (and spam), or use the resend button below.');
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
    <form onSubmit={handleLogin} className="card p-8 space-y-5">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Password"
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
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendConfirmation}
          disabled={resending || !email}
          className="text-sm text-foreground font-medium hover:text-primary underline underline-offset-2 disabled:opacity-50 transition-colors"
        >
          {resending ? 'Resending...' : "Didn't receive confirmation email? Resend it"}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-background to-surface border border-border/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5" />
              <path d="M11 6V3a1 1 0 0 0-1-1H7.5" />
              <path d="M12 12H3" />
              <path d="M18 12h3" />
              <path d="M12 12v9" />
              <path d="M12 12L3 3" />
              <path d="m12 12 9-9" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to access the Mehta Kutumb</p>
        </div>

        <Suspense fallback={<div className="card p-8 text-sm text-muted">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary underline underline-offset-2">Register here</Link>
        </p>
      </div>
    </div>
  );
}

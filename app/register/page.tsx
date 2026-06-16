'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile_number: mobile || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile row is created automatically via DB trigger (with email populated).
    // Important: Supabase Auth usually requires email confirmation before the user can sign in.

    if (data.session) {
      // Email confirmation is disabled in this Supabase project
      toast.success('Account created successfully. An admin will review and approve your access.');
      router.push('/dashboard');
    } else {
      // Email confirmation is enabled — user must click the link in their email first
      toast.success('Account created! Please check your email (including spam) and click the confirmation link, then an admin can approve you.', {
        duration: 8000,
      });
      // Stay on the page or go to login
      router.push('/login');
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-background to-surface border border-border/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Join the Mehta Kutumb</h1>
          <p className="mt-1 text-sm text-muted">Create an account. An admin will approve your access.</p>
        </div>

        <form onSubmit={handleRegister} className="card p-8 space-y-5">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mobile Number (optional)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 98xxx xxxxx"
          />
          <Input
            label="Password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-sm text-accent">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-foreground font-medium">
            After registration your account will be in \u201cpending\u201d status until an admin approves you.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="font-medium text-primary hover:text-primary underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

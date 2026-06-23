'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import Image from 'next/image';
import { BrandLogo } from '@/components/ui/BrandLogo';

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
    <div className="flex min-h-screen bg-background">
      {/* Right Hero Side (Swapped for variation) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary overflow-hidden">
        <Image 
          src="/images/auth-hero.png" 
          alt="Mehta Kutumb Heritage" 
          fill 
          className="object-cover opacity-90 mix-blend-overlay scale-x-[-1]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
        <div className="absolute bottom-16 right-16 left-16 text-right">
          <h2 className="font-serif text-4xl text-white font-bold mb-4 drop-shadow-md">Join the Kutumb</h2>
          <p className="text-white/80 text-lg ml-auto max-w-md font-medium leading-relaxed">
            Register to claim your place in the family directory. Preserve your legacy for generations to come.
          </p>
        </div>
      </div>

      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="absolute top-8 right-8 lg:left-8 lg:right-auto">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>
        </div>

        <div className="w-full max-w-sm animate-fade-in mt-12 lg:mt-0">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Create Account</h1>
            <p className="mt-2 text-[15px] font-medium text-muted">Join the Mehta Kutumb digital directory</p>
          </div>

        <form onSubmit={handleRegister} className="premium-card p-8 md:p-10 space-y-6">
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

        <p className="mt-8 text-center text-[15px] font-medium text-muted">
          Already have an account? <Link href="/login" className="text-primary hover:text-primary-hover underline underline-offset-4 decoration-accent/50 font-bold transition-all">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

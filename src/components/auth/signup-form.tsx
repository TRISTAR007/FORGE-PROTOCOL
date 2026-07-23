'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { CheckCircle2 } from 'lucide-react';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
    // If email confirmation is required, Supabase returns a user with no session yet.
    setNeedsConfirmation(!data.session);
  };

  if (submitted) {
    return (
      <div className="animate-fadeIn text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok-dim text-ok">
          <CheckCircle2 size={24} />
        </div>
        <h1 className="font-display text-2xl tracking-wide">
          {needsConfirmation ? 'Check your inbox' : "You're in"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {needsConfirmation
            ? `We sent a confirmation link to ${email}. Click it to activate your account, then sign in.`
            : 'Your account has been created.'}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button size="lg">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl tracking-wide">Start your protocol</h1>
      <p className="mt-2 text-sm text-ink-muted">Day 1 of 365 begins the moment you sign up.</p>

      <div className="mt-8">
        <GoogleButton />
      </div>

      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        {error ? <FormError message={error} /> : null}
        <Button type="submit" size="lg" loading={loading} className="mt-1">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-forge hover:text-forge-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}

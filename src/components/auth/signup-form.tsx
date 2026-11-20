'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('auth');
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
      setError(t('passwordTooShort'));
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
          {needsConfirmation ? t('checkEmail') : t('accountReady')}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {needsConfirmation
            ? t('checkEmailBody', { email })
            : t('accountReadyBody')}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button size="lg">{t('signInLink')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl tracking-wide">{t('createAccount')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('signUpSubtitle')}</p>

      <div className="mt-8">
        <GoogleButton />
      </div>

      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t('fullName')}
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label={t('email')}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label={t('password')}
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        {error ? <FormError message={error} /> : null}
        <Button type="submit" size="lg" loading={loading} className="mt-1">
          {t('signUp')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-semibold text-forge hover:text-forge-hover">
          {t('signInLink')}
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';
import { GoogleButton } from './google-button';
import { OrDivider } from './or-divider';
import { safeNextPath } from '@/lib/utils';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === 'Invalid login credentials' ? t('incorrect') : error.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="font-display text-3xl tracking-wide">{t('welcomeBack')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('signInSubtitle')}</p>

      <div className="mt-8">
        <GoogleButton next={next} />
      </div>

      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error ? <FormError message={error} /> : null}
        <Button type="submit" size="lg" loading={loading} className="mt-1">
          {t('signIn')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t('noAccount')}{' '}
        <Link href="/signup" className="font-semibold text-forge hover:text-forge-hover">
          {t('createOne')}
        </Link>
      </p>
    </div>
  );
}

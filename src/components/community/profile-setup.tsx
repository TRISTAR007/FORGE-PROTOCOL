'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { COACHES } from '@/lib/coaches';
import { countryOptions, flagEmoji } from '@/lib/community/countries';
import { USERNAME_PATTERN, type CommunityProfile } from '@/lib/community/types';
import type { ProfileInput } from '@/lib/community/api';
import { cleanMessage } from '@/lib/community/moderation';
import { cn } from '@/lib/utils';

/** Join form (new profile) — also reused to edit an existing profile. */
export function ProfileForm({
  initial,
  defaultCoach,
  editing,
  onSubmit,
}: {
  initial?: CommunityProfile | null;
  defaultCoach: string;
  editing?: boolean;
  onSubmit: (input: ProfileInput) => Promise<string | null>;
}) {
  const t = useTranslations('community');
  const locale = useLocale();
  const countries = useMemo(() => countryOptions(locale), [locale]);

  const [username, setUsername] = useState(initial?.username ?? '');
  const [displayName, setDisplayName] = useState(initial?.display_name ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar_coach ?? defaultCoach);
  const [country, setCountry] = useState(initial?.country ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [show, setShow] = useState(initial?.favorite_show ?? '');
  const [age, setAge] = useState(Boolean(editing));
  const [rules, setRules] = useState(Boolean(editing));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!USERNAME_PATTERN.test(username)) {
      setError(t('usernameInvalid'));
      return;
    }
    setSaving(true);
    const err = await onSubmit({
      username,
      display_name: displayName.trim() ? cleanMessage(displayName.trim()).text.slice(0, 40) : null,
      avatar_coach: avatar,
      country: country || null,
      bio: bio.trim() ? cleanMessage(bio.trim()).text.slice(0, 160) : null,
      favorite_show: show.trim() ? cleanMessage(show.trim()).text.slice(0, 60) : null,
    });
    setSaving(false);
    if (err) setError(err);
  };

  const selectClass =
    'w-full rounded-sm border border-line bg-bg px-3.5 py-2.5 text-sm text-ink focus:border-forge focus:outline-none';

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="community-username"
          label={t('username')}
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
          maxLength={20}
          autoComplete="off"
          required
          disabled={editing}
        />
        <Input
          id="community-display"
          label={t('displayName')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
        />
      </div>
      {!editing ? <p className="-mt-3 text-xs text-ink-faint">{t('usernameHint')}</p> : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('avatar')}</p>
        <div className="flex flex-wrap gap-2">
          {COACHES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setAvatar(c.id)}
              aria-pressed={avatar === c.id}
              aria-label={c.name}
              className={cn(
                'rounded-full p-0.5 transition-transform',
                avatar === c.id ? 'scale-110 ring-2 ring-forge ring-offset-2 ring-offset-surface' : 'opacity-70 hover:opacity-100'
              )}
            >
              <CoachAvatar coach={c} size={44} />
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('country')}</span>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          <option value="">{t('countryNone')}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {flagEmoji(c.code)} {c.name}
            </option>
          ))}
        </select>
      </label>

      <Input id="community-show" label={t('favoriteShow')} value={show} onChange={(e) => setShow(e.target.value)} maxLength={60} />
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('bio')}</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={2}
          className={cn(selectClass, 'resize-none')}
        />
      </label>

      {!editing ? (
        <div className="rounded-md border border-line bg-bg p-4">
          <p className="flex items-center gap-2 font-display text-sm tracking-wide">
            <ShieldCheck size={16} className="text-ok" /> {t('rulesTitle')}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
            {(['rule1', 'rule2', 'rule3', 'rule4', 'rule5'] as const).map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-forge" />
                {t(r)}
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="h-4 w-4 accent-[#FF4D94]" />
            {t('ageConfirm')}
          </label>
          <label className="mt-2 flex items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={rules} onChange={(e) => setRules(e.target.checked)} className="h-4 w-4 accent-[#FF4D94]" />
            {t('rulesAccept')}
          </label>
        </div>
      ) : null}

      {error ? <FormError message={error} /> : null}
      <Button type="submit" size="lg" loading={saving} disabled={!age || !rules} className="w-full">
        {editing ? t('saveProfile') : saving ? t('joining') : t('join')}
      </Button>
    </form>
  );
}

export function ProfileSetup(props: { defaultCoach: string; onSubmit: (input: ProfileInput) => Promise<string | null> }) {
  const t = useTranslations('community');
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="p-6">
        <h2 className="font-display text-2xl tracking-wide">{t('setupTitle')}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t('setupBody')}</p>
        <div className="mt-6">
          <ProfileForm {...props} />
        </div>
      </CardContent>
    </Card>
  );
}

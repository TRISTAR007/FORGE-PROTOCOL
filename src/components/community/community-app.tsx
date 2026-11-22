'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Crown, Hash, Loader2, MessagesSquare, Pencil, ServerCog, Swords, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { ProfileAvatar } from '@/components/community/profile-avatar';
import { RaidPanel } from '@/components/community/raid-panel';
import { BeltBadge } from '@/components/community/belt-badge';
import { ChatRoom, useChannelName } from '@/components/community/chat-room';
import { ProfileForm, ProfileSetup } from '@/components/community/profile-setup';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useTrainingStats } from '@/hooks/use-training-stats';
import { createClient } from '@/lib/supabase/client';
import { countryName, flagEmoji } from '@/lib/community/countries';
import {
  blockUser,
  createProfile,
  getMyProfile,
  getProfiles,
  isMissingTable,
  isUsernameTaken,
  leaderboard,
  listBlocks,
  listChannels,
  syncXp,
  unblockUser,
  updateProfile,
  type ProfileInput,
} from '@/lib/community/api';
import type { Channel, CommunityProfile } from '@/lib/community/types';
import { cn } from '@/lib/utils';

type Status = 'loading' | 'not-setup' | 'needs-profile' | 'ready';

function Leaderboard({ supabase, me }: { supabase: ReturnType<typeof createClient>; me: CommunityProfile }) {
  const t = useTranslations('community');
  const locale = useLocale();
  const [country, setCountry] = useState<string | null>(null);
  const [rows, setRows] = useState<CommunityProfile[] | null>(null);

  useEffect(() => {
    let alive = true;
    void leaderboard(supabase, country).then(({ data }) => {
      if (alive) setRows(data ?? []);
    });
    return () => {
      alive = false;
    };
  }, [supabase, country]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <p className="flex items-center gap-2 font-display text-base tracking-wide">
            <Crown size={16} className="text-brass" /> {t('leaderboardTitle')}
          </p>
          <p className="text-xs text-ink-faint">{t('leaderboardSubtitle')}</p>
        </div>
        {me.country ? (
          <div className="flex rounded-full border border-line bg-bg p-0.5 text-xs">
            <button
              onClick={() => setCountry(null)}
              className={cn('rounded-full px-3 py-1', !country ? 'bg-surface-raised text-ink' : 'text-ink-muted')}
            >
              {t('allCountries')}
            </button>
            <button
              onClick={() => setCountry(me.country)}
              className={cn('rounded-full px-3 py-1', country ? 'bg-surface-raised text-ink' : 'text-ink-muted')}
            >
              {flagEmoji(me.country)} {countryName(me.country, locale)}
            </button>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {!rows ? (
          <div className="flex justify-center py-10 text-ink-faint">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          rows.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5',
                p.id === me.id ? 'bg-forge-dim/40 ring-1 ring-forge/40' : i % 2 ? 'bg-surface/40' : ''
              )}
            >
              <span
                className={cn(
                  'w-8 text-center font-display text-lg',
                  i === 0 ? 'text-brass' : i === 1 ? 'text-ink-muted' : i === 2 ? 'text-[#C98A5A]' : 'text-ink-faint'
                )}
              >
                {i + 1}
              </span>
              <ProfileAvatar profile={p} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {p.display_name || p.username} {p.country ? flagEmoji(p.country) : ''}{' '}
                  {p.id === me.id ? <span className="font-mono text-[10px] text-forge">({t('you')})</span> : null}
                </p>
                <BeltBadge level={p.level} />
              </div>
              <span className="font-mono text-sm text-ink">{p.xp.toLocaleString(locale)} XP</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommunityInner() {
  const t = useTranslations('community');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { settings, progress } = useProgress();
  const { level } = useTrainingStats();
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);
  const channelName = useChannelName();

  const [status, setStatus] = useState<Status>('loading');
  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [profiles, setProfiles] = useState<Map<string, CommunityProfile>>(new Map());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [online, setOnline] = useState(1);
  const [viewing, setViewing] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const requested = useRef(new Set<string>());

  const tabParam = searchParams.get('tab');
  const tab = tabParam === 'leaderboard' || tabParam === 'raid' ? tabParam : 'chat';
  const activeSlug = searchParams.get('c');
  const active = channels.find((c) => c.slug === activeSlug) ?? channels[0];

  // Load profile + channels.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data, error } = await getMyProfile(supabase, user.id);
      if (!alive) return;
      if (isMissingTable(error)) {
        setStatus('not-setup');
        return;
      }
      const { data: chans, error: chanErr } = await listChannels(supabase);
      if (!alive) return;
      if (isMissingTable(chanErr)) {
        setStatus('not-setup');
        return;
      }
      setChannels(chans ?? []);
      if (data) {
        setMe(data);
        setProfiles((prev) => new Map(prev).set(data.id, data));
        setBlocked(await listBlocks(supabase, user.id));
        setStatus('ready');
      } else setStatus('needs-profile');
    })();
    return () => {
      alive = false;
    };
  }, [supabase, user.id]);

  // Keep the public XP (and hero avatar, once the database supports it) in step with training.
  const avatarJson = JSON.stringify(progress.avatar);
  useEffect(() => {
    if (!me) return;
    const canStoreAvatar = 'avatar' in me;
    const avatarChanged = canStoreAvatar && JSON.stringify(me.avatar ?? null) !== avatarJson;
    if (me.xp === level.xp && me.level === level.level && !avatarChanged) return;
    const id = setTimeout(() => {
      const avatar = canStoreAvatar ? JSON.parse(avatarJson) : undefined;
      void syncXp(supabase, me.id, level.xp, level.level, avatar).then(({ error }) => {
        if (!error) setMe((cur) => (cur ? { ...cur, xp: level.xp, level: level.level, ...(canStoreAvatar ? { avatar } : {}) } : cur));
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [supabase, me, level.xp, level.level, avatarJson]);

  // Live "online now" count.
  useEffect(() => {
    if (status !== 'ready' || !me) return;
    const presence = supabase.channel('dojo-presence', { config: { presence: { key: me.id } } });
    presence
      .on('presence', { event: 'sync' }, () => setOnline(Math.max(1, Object.keys(presence.presenceState()).length)))
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') void presence.track({ username: me.username });
      });
    return () => {
      void supabase.removeChannel(presence);
    };
  }, [supabase, status, me]);

  const requestProfiles = useCallback(
    (ids: string[]) => {
      const missing = ids.filter((id) => !requested.current.has(id));
      if (missing.length === 0) return;
      missing.forEach((id) => requested.current.add(id));
      void getProfiles(supabase, missing).then(({ data }) => {
        if (!data?.length) return;
        setProfiles((prev) => {
          const next = new Map(prev);
          data.forEach((p) => next.set(p.id, p));
          return next;
        });
      });
    },
    [supabase]
  );

  const onCreate = async (input: ProfileInput): Promise<string | null> => {
    if (await isUsernameTaken(supabase, input.username)) return t('usernameTaken');
    const { data, error } = await createProfile(supabase, user.id, input, level.xp, level.level);
    if (error || !data) return error?.code === '23505' ? t('usernameTaken') : t('joinError');
    setMe(data);
    setProfiles((prev) => new Map(prev).set(data.id, data));
    setStatus('ready');
    return null;
  };

  const onUpdate = async (input: ProfileInput): Promise<string | null> => {
    if (!me) return null;
    const { username: _ignored, ...rest } = input;
    void _ignored;
    const { data, error } = await updateProfile(supabase, me.id, rest);
    if (error || !data) return t('joinError');
    setMe(data);
    setProfiles((prev) => new Map(prev).set(data.id, data));
    setEditing(false);
    toast(t('profileSaved'));
    return null;
  };

  const toggleBlock = async (userId: string) => {
    const name = profiles.get(userId)?.username ?? '';
    if (blocked.has(userId)) {
      await unblockUser(supabase, user.id, userId);
      setBlocked((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      toast(t('unblocked', { name }));
    } else {
      await blockUser(supabase, user.id, userId);
      setBlocked((prev) => new Set(prev).add(userId));
      toast(t('blocked', { name }), 'info');
    }
  };

  const go = (params: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    router.replace(`/community${next.toString() ? `?${next}` : ''}`);
  };

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-1 text-ink-muted">{t('subtitle')}</p>
      </div>
      {status === 'ready' ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok-dim/50 px-3 py-1 text-xs font-semibold text-ok">
          <span className="h-2 w-2 animate-ember rounded-full bg-ok" /> {t('online', { count: online })}
        </span>
      ) : null}
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        {header}
        <div className="flex justify-center py-20 text-ink-faint">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (status === 'not-setup') {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ServerCog size={32} className="text-brass" />
            <p className="font-display text-lg tracking-wide">{t('notSetup')}</p>
            <p className="max-w-md text-sm text-ink-muted">{t('notSetupBody')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'needs-profile' || !me) {
    return (
      <div className="animate-fadeIn space-y-6">
        {header}
        <ProfileSetup defaultCoach={settings.coachId} onSubmit={onCreate} />
      </div>
    );
  }

  const viewed = viewing ? profiles.get(viewing) : null;

  return (
    <div className="animate-fadeIn space-y-5">
      {header}

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-full border border-line bg-surface p-1">
          {(['chat', 'raid', 'leaderboard'] as const).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => go({ tab: id === 'chat' ? null : id })}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                tab === id ? 'bg-brand-gradient text-white shadow-glow' : 'text-ink-muted hover:text-ink'
              )}
            >
              {id === 'chat' ? <MessagesSquare size={14} /> : id === 'raid' ? <Swords size={14} /> : <Crown size={14} />}
              {id === 'chat' ? t('tabChat') : id === 'raid' ? t('tabRaid') : t('tabLeaderboard')}
            </button>
          ))}
        </div>
        <button
          onClick={() => setViewing(me.id)}
          className="ms-auto flex items-center gap-2 rounded-full border border-line bg-surface py-1 pe-3 ps-1 text-sm hover:border-forge/40"
        >
          <ProfileAvatar profile={me} size={28} />
          <span className="font-semibold">{me.username}</span>
          <BeltBadge level={me.level} compact />
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[calc(100dvh-19rem)] min-h-[440px] flex-col lg:h-[calc(100vh-17rem)] lg:flex-row">
          {tab === 'chat' ? (
            <>
              {/* Channels: horizontal pills on mobile, sidebar on desktop */}
              <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line p-2 no-scrollbar lg:w-56 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-e">
                <p className="hidden px-2 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint lg:block">
                  {t('channels')}
                </p>
                {channels.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => go({ c: c.slug })}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-sm transition-colors',
                      active?.id === c.id ? 'bg-forge-dim text-forge' : 'text-ink-muted hover:bg-surface-hover hover:text-ink'
                    )}
                  >
                    <Hash size={14} />
                    {channelName(c)}
                  </button>
                ))}
              </nav>
              <div className="min-h-0 flex-1">
                {active ? (
                  <ChatRoom
                    key={active.id}
                    supabase={supabase}
                    me={me}
                    channel={active}
                    profiles={profiles}
                    requestProfiles={requestProfiles}
                    blocked={blocked}
                    onBlock={(id) => void toggleBlock(id)}
                    onOpenProfile={setViewing}
                  />
                ) : null}
              </div>
            </>
          ) : tab === 'raid' ? (
            <div className="min-h-0 flex-1">
              <RaidPanel
                supabase={supabase}
                me={me}
                onProfile={(p) => {
                  setMe(p);
                  setProfiles((prev) => new Map(prev).set(p.id, p));
                }}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <Leaderboard supabase={supabase} me={me} />
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={viewing !== null}
        onClose={() => {
          setViewing(null);
          setEditing(false);
        }}
        title={t('profile')}
        size="sm"
      >
        {viewed ? (
          editing && viewed.id === me.id ? (
            <ProfileForm initial={me} defaultCoach={me.avatar_coach} editing onSubmit={onUpdate} />
          ) : (
            <div className="flex flex-col items-center text-center">
              <ProfileAvatar profile={viewed} size={112} large />
              <p className="mt-4 font-display text-xl tracking-wide">{viewed.display_name || viewed.username}</p>
              <p className="text-sm text-ink-faint">@{viewed.username}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <BeltBadge level={viewed.level} />
                <span className="font-mono text-xs text-ink-muted">{tc('xp', { xp: viewed.xp.toLocaleString(locale) })}</span>
              </div>
              {viewed.country ? (
                <p className="mt-2 text-sm text-ink-muted">
                  {flagEmoji(viewed.country)} {countryName(viewed.country, locale)}
                </p>
              ) : null}
              {viewed.bio ? <p className="mt-3 text-sm text-ink">{viewed.bio}</p> : null}
              {viewed.favorite_show ? <p className="mt-2 text-xs text-ink-muted">❤ {viewed.favorite_show}</p> : null}
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                {t('joined', { date: new Date(viewed.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) })}
              </p>
              {viewed.id === me.id ? (
                <Button variant="secondary" size="sm" className="mt-5" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> {t('editProfile')}
                </Button>
              ) : (
                <Button variant="danger" size="sm" className="mt-5" onClick={() => void toggleBlock(viewed.id)}>
                  <Users size={14} />
                  {blocked.has(viewed.id) ? t('unblock', { name: viewed.username }) : t('block', { name: viewed.username })}
                </Button>
              )}
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}

export function CommunityApp() {
  return (
    <Suspense>
      <CommunityInner />
    </Suspense>
  );
}

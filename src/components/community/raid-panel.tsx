'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, RefreshCw, ServerCog, Shield, Swords, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BossEmblem } from '@/components/boss/boss-emblem';
import { ProfileAvatar } from './profile-avatar';
import { flagEmoji } from '@/lib/community/countries';
import { joinGuild, raidSummary, type RaidSummary } from '@/lib/community/raid';
import { isMissingColumn, isMissingTable } from '@/lib/community/api';
import type { CommunityProfile } from '@/lib/community/types';
import { GUILDS, GUILD_COLORS, isGuild, msUntilRaidReset, raidBossForWeek, raidWeekStart, type GuildId } from '@/lib/program/bosses';
import type { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Supabase = ReturnType<typeof createClient>;

function isMissingFunction(error: { code?: string; message?: string } | null | undefined) {
  return !!error && (error.code === 'PGRST202' || error.code === '42883' || /function .* does not exist|could not find the function/i.test(error.message ?? ''));
}

/** Pick one of the four guilds. */
function GuildPicker({ onPick, busy }: { onPick: (g: GuildId) => void; busy: GuildId | null }) {
  const t = useTranslations('raid');
  return (
    <div className="p-4">
      <h3 className="font-display text-lg tracking-wide">{t('pickTitle')}</h3>
      <p className="text-sm text-ink-muted">{t('pickBody')}</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {GUILDS.map((g) => (
          <button
            key={g}
            type="button"
            disabled={busy !== null}
            onClick={() => onPick(g)}
            className="flex items-center gap-3 rounded-md border border-line p-3 text-start transition-colors hover:bg-surface disabled:opacity-60"
            style={{ borderColor: `${GUILD_COLORS[g]}55` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md" style={{ background: `${GUILD_COLORS[g]}22`, color: GUILD_COLORS[g] }}>
              {busy === g ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            </span>
            <span>
              <span className="block font-semibold" style={{ color: GUILD_COLORS[g] }}>
                {t(`guilds.${g}.name`)}
              </span>
              <span className="block text-xs text-ink-faint">{t(`guilds.${g}.motto`)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Weekly community raid: one shared boss, four guilds, every workout deals damage. */
export function RaidPanel({ supabase, me, onProfile }: { supabase: Supabase; me: CommunityProfile; onProfile: (p: CommunityProfile) => void }) {
  const t = useTranslations('raid');
  const tBoss = useTranslations('bosses');
  const locale = useLocale();
  const [summary, setSummary] = useState<RaidSummary | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'not-setup' | 'error'>('loading');
  const [busy, setBusy] = useState<GuildId | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const guild = isGuild(me.guild) ? me.guild : null;
  const supportsGuilds = 'guild' in me;

  const load = useCallback(async () => {
    const { data, error } = await raidSummary(supabase);
    if (error) {
      setState(isMissingFunction(error) || isMissingTable(error) || isMissingColumn(error) ? 'not-setup' : 'error');
      return;
    }
    setSummary(data as RaidSummary);
    setState('ready');
  }, [supabase]);

  useEffect(() => {
    if (!supportsGuilds) return;
    let alive = true;
    const run = () => {
      if (alive) void load();
    };
    run();
    // Light polling while the tab is open (no realtime needed for a weekly bar).
    const id = setInterval(run, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [load, supportsGuilds]);

  if (!supportsGuilds || state === 'not-setup') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <ServerCog size={30} className="text-brass" />
        <p className="font-display text-lg tracking-wide">{t('notSetup')}</p>
        <p className="max-w-md text-sm text-ink-muted">{t('notSetupBody')}</p>
      </div>
    );
  }

  const pick = async (g: GuildId) => {
    setBusy(g);
    const { error } = await joinGuild(supabase, me.id, g);
    setBusy(null);
    if (!error) onProfile({ ...me, guild: g });
  };

  if (!guild) return <GuildPicker onPick={(g) => void pick(g)} busy={busy} />;

  if (!summary && state === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-ink-muted">{t('loadError')}</p>
        <Button variant="secondary" size="sm" onClick={() => void load()}>
          <RefreshCw size={14} /> {t('refresh')}
        </Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center text-ink-faint">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const boss = raidBossForWeek(summary.week_start || raidWeekStart());
  const hpLeft = Math.max(0, summary.hp - summary.total);
  const defeated = hpLeft === 0;
  const ms = msUntilRaidReset();
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const maxGuild = Math.max(1, ...summary.guilds.map((g) => g.damage));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-start">
        <BossEmblem boss={boss} size={88} defeated={defeated} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-danger">{t('weeklyBoss')}</p>
          <h3 className="font-display text-2xl tracking-wide">{tBoss(`${boss.key}.name`)}</h3>
          <p className="text-sm text-ink-muted">{tBoss(`${boss.key}.title`)}</p>
          <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-ink-faint">
            <Timer size={12} /> {t('resetsIn', { d: days, h: hours })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('refresh')}
          onClick={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between font-mono text-xs">
          <span className="text-danger">{defeated ? t('defeated') : t('hp')}</span>
          <span className="text-ink-muted">
            {hpLeft.toLocaleString(locale)} / {summary.hp.toLocaleString(locale)}
          </span>
        </div>
        <div className="mt-1 h-4 overflow-hidden rounded-full border border-danger/40 bg-danger-dim">
          <div className="h-full rounded-full bg-gradient-to-r from-danger to-forge" style={{ width: `${(hpLeft / summary.hp) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          <Swords size={13} className="me-1 inline text-forge" />
          {t('yourDamage', { n: summary.mine.toLocaleString(locale) })} · <span style={{ color: GUILD_COLORS[guild] }}>{t(`guilds.${guild}.name`)}</span>
        </p>
        <p className="mt-1 text-xs text-ink-faint">{t('howTo')}</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('guildStandings')}</p>
          <ul className="space-y-2">
            {GUILDS.map((g) => {
              const row = summary.guilds.find((x) => x.guild === g);
              return (
                <li key={g} className={cn('rounded-md border p-2.5', g === guild ? 'border-forge/50' : 'border-line')}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold" style={{ color: GUILD_COLORS[g] }}>
                      {t(`guilds.${g}.name`)}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {(row?.damage ?? 0).toLocaleString(locale)} · {t('members', { n: row?.members ?? 0 })}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full rounded-full" style={{ width: `${((row?.damage ?? 0) / maxGuild) * 100}%`, background: GUILD_COLORS[g] }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <button onClick={() => onProfile({ ...me, guild: null })} className="mt-2 text-xs font-semibold text-ink-faint hover:text-ink">
            {t('switchGuild')}
          </button>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t('topHunters')}</p>
          {summary.top.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-4 text-center text-sm text-ink-faint">{t('noHits')}</p>
          ) : (
            <ol className="space-y-1">
              {summary.top.map((row, i) => (
                <li key={row.user_id} className={cn('flex items-center gap-2.5 rounded-md px-2 py-1.5', row.user_id === me.id && 'bg-forge-dim/40')}>
                  <span className="w-5 text-center font-display text-sm text-ink-faint">{i + 1}</span>
                  <ProfileAvatar profile={row} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {row.username} {row.country ? flagEmoji(row.country) : ''}
                  </span>
                  {isGuild(row.guild) ? <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: GUILD_COLORS[row.guild] }} /> : null}
                  <span className="font-mono text-xs text-ink-muted">{row.damage.toLocaleString(locale)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

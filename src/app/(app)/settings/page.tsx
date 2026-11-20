'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, BellRing, Download, FileJson, LogOut, Mic, RotateCcw, Trash2, Volume2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { SwitchRow } from '@/components/ui/switch';
import { CoachAvatar } from '@/components/coach/coach-portrait';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { useProgram } from '@/hooks/use-program';
import { useCoach } from '@/hooks/use-coach';
import { createClient } from '@/lib/supabase/client';
import { COACHES } from '@/lib/coaches';
import { APP_NAME } from '@/lib/brand';
import { todayKey, cn } from '@/lib/utils';
import { EMPTY_PROGRESS, type NutritionRegion, type TrainingMode, type UnitSystem } from '@/lib/types';
import { primeAudio, beep, vibrate } from '@/lib/session-cues';
import { clearOfflinePageCache } from '@/lib/pwa';
import { isNative, scheduleDailyReminder } from '@/lib/native';
import { writeLocalStorage } from '@/hooks/use-local-storage';
import { PHOTO_BUCKET } from '@/components/progress/progress-photos';
import { dailyReminderIcs, downloadFile, exportJson, measurementsCsv, strengthCsv, workoutLogCsv } from '@/lib/export';

const MODES: TrainingMode[] = ['home', 'dumbbells', 'gym'];
const REGIONS: NutritionRegion[] = ['global', 'west-africa', 'south-asia', 'east-asia', 'latin-america', 'mena'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-line bg-bg px-4 py-3">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="font-mono text-sm text-ink">{children}</span>
    </div>
  );
}

function clearLocalAppData(userId: string) {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('forge:')) localStorage.removeItem(key);
    }
  } catch {
    writeLocalStorage(`forge:unsaved-progress:${userId}`, null);
  }
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const { user, profile, updateLocalProfile, setProgramStartDate, signOut, signingOut } = useAuth();
  const { progress, settings, updateSettings } = useProgress();
  const { todayDayNumber, totalDays } = useProgram();
  const { coach, say } = useCoach();
  const { toast } = useToast();
  const native = isNative();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState(profile?.program_start_date ?? todayKey());
  const [savingStart, setSavingStart] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setSaving(false);
    if (error) {
      toast(t('saveError'), 'error');
      return;
    }
    updateLocalProfile({ full_name: fullName });
    toast(t('profileUpdated'));
  };

  const handleSaveStartDate = async () => {
    if (!startDate || startDate > todayKey()) {
      toast(t('startDateFuture'), 'error');
      return;
    }
    setSavingStart(true);
    const ok = await setProgramStartDate(startDate);
    setSavingStart(false);
    toast(ok ? t('startDateUpdated') : t('startDateError'), ok ? 'success' : 'error');
  };

  const handleResetProgress = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    const supabase = createClient();
    // Keep preferences (coach, units, cues, goals) — only the training record is cleared.
    const fresh = { ...EMPTY_PROGRESS, settings: progress.settings, onboardingCompleted: true };
    const { error } = await supabase.from('user_progress').update({ data: fresh }).eq('user_id', user.id);
    const startOk = error ? false : await setProgramStartDate(todayKey());
    setResetting(false);
    setConfirmReset(false);
    if (error || !startOk) {
      toast(t('resetError'), 'error');
      return;
    }
    writeLocalStorage(`forge:unsaved-progress:${user.id}`, null);
    toast(t('resetDone'));
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    const supabase = createClient();

    // Storage objects can only be removed through the Storage API, so clear photos first.
    const { data: files } = await supabase.storage.from(PHOTO_BUCKET).list(user.id, { limit: 1000 });
    const paths = Array.from(
      new Set([...progress.progressPhotos.map((p) => p.path), ...(files ?? []).map((f) => `${user.id}/${f.name}`)])
    );
    if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);

    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      setDeleting(false);
      toast(t('deleteError'), 'error');
      return;
    }
    await supabase.auth.signOut().catch(() => {});
    await clearOfflinePageCache();
    clearLocalAppData(user.id);
    window.location.href = '/';
  };

  const setReminder = async () => {
    if (native) {
      const result = await scheduleDailyReminder(settings.reminderTime, APP_NAME, coach.lines.greet[0]);
      if (result === 'scheduled') toast(t('reminderSet', { time: settings.reminderTime }));
      else if (result === 'denied') toast(t('reminderDenied'), 'error');
      return;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    downloadFile('level-up-dojo-reminder.ics', dailyReminderIcs(settings.reminderTime, totalDays - todayDayNumber + 1, siteUrl), 'text/calendar');
    toast(t('calendarHint'), 'info');
  };

  const stamp = todayKey();

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">{t('title')}</h1>
        <p className="mt-1 text-ink-muted">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('coach')}</CardTitle>
          <Link href="/coaches" className="flex items-center gap-1 text-sm font-semibold text-forge hover:text-forge-hover">
            {t('allCoaches')} <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted">{t('coachDesc')}</p>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {COACHES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  updateSettings({ coachId: c.id });
                }}
                aria-pressed={settings.coachId === c.id}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md p-1.5 transition-colors',
                  settings.coachId === c.id ? 'bg-forge-dim ring-2 ring-forge' : 'hover:bg-surface-hover'
                )}
              >
                <CoachAvatar coach={c} size={48} />
                <span className="truncate text-[11px] font-semibold text-ink">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('language')}</p>
            <LanguageSwitcher compact />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('units')}</p>
            <Segmented<UnitSystem>
              label={t('units')}
              options={[
                { id: 'metric', label: t('metric') },
                { id: 'imperial', label: t('imperial') },
              ]}
              value={settings.units}
              onChange={(units) => updateSettings({ units })}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('trainingMode')}</p>
            <p className="mb-2 text-xs text-ink-faint">{t('trainingModeDesc')}</p>
            <Segmented<TrainingMode>
              label={t('trainingMode')}
              options={MODES.map((m) => ({ id: m, label: t(`modes.${m}`) }))}
              value={settings.trainingMode}
              onChange={(trainingMode) => updateSettings({ trainingMode })}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('region')}</p>
            <p className="mb-2 text-xs text-ink-faint">{t('regionDesc')}</p>
            <select
              value={settings.region}
              onChange={(e) => updateSettings({ region: e.target.value as NutritionRegion })}
              className="rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-forge focus:outline-none"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`regions.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('cues')}</p>
            <SwitchRow
              label={t('voice')}
              description={t('voiceDesc')}
              checked={settings.voice}
              onChange={(voice) => {
                updateSettings({ voice });
                if (voice) say('greet', {}, 2, true);
              }}
            />
            <SwitchRow
              label={t('sound')}
              description={t('soundDesc')}
              checked={settings.sound}
              onChange={(sound) => {
                primeAudio();
                updateSettings({ sound });
                if (sound) beep(880, 120);
              }}
            />
            <SwitchRow
              label={t('vibration')}
              description={t('vibrationDesc')}
              checked={settings.vibration}
              onChange={(vibration) => {
                updateSettings({ vibration });
                if (vibration) vibrate(120);
              }}
            />
            <div className="mt-1 flex gap-4 px-1">
              <button
                onClick={() => say('work', { exercise: 'Push-up', set: 1, sets: 3, reps: '10' }, 0, true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-forge hover:text-forge-hover"
              >
                <Mic size={13} /> {t('testVoice')}
              </button>
              <button
                onClick={() => {
                  primeAudio();
                  beep(660, 90);
                  setTimeout(() => beep(990, 240), 300);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-forge hover:text-forge-hover"
              >
                <Volume2 size={13} /> {t('testSound')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reminder')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted">{native ? t('reminderNativeDesc') : t('reminderDesc')}</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Input
                id="reminder-time"
                label={t('time')}
                type="time"
                value={settings.reminderTime}
                onChange={(e) => e.target.value && updateSettings({ reminderTime: e.target.value })}
              />
            </div>
            <Button variant="secondary" onClick={() => void setReminder()}>
              <BellRing size={16} />
              {native ? t('setNotification') : t('addCalendar')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input label={t('fullName')} id="settings-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label={t('email')} id="settings-email" value={user.email ?? ''} disabled />
          </div>
          <Button onClick={handleSaveProfile} loading={saving} className="mt-4">
            {t('saveChanges')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('program')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label={t('today')}>{t('dayOf', { day: todayDayNumber, total: totalDays })}</Row>
          <Row label={t('memberSince')}>
            {profile ? new Date(profile.created_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '—'}
          </Row>
          <div className="rounded-sm border border-line bg-bg p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-44">
                <Input
                  id="program-start"
                  label={t('startDate')}
                  type="date"
                  max={stamp}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleSaveStartDate}
                loading={savingStart}
                disabled={startDate === profile?.program_start_date}
              >
                {t('update')}
              </Button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">{t('startDateHint')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('data')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted">{t('dataDesc')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadFile(`level-up-dojo-${stamp}.json`, exportJson(progress, profile), 'application/json')}
            >
              <FileJson size={14} /> {t('exportJson')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                downloadFile(
                  `level-up-dojo-workouts-${stamp}.csv`,
                  workoutLogCsv(progress, profile?.program_start_date ?? stamp, todayDayNumber),
                  'text/csv'
                )
              }
            >
              <Download size={14} /> {t('exportWorkouts')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadFile(`level-up-dojo-measurements-${stamp}.csv`, measurementsCsv(progress), 'text/csv')}>
              <Download size={14} /> {t('exportMeasurements')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadFile(`level-up-dojo-strength-${stamp}.csv`, strengthCsv(progress), 'text/csv')}>
              <Download size={14} /> {t('exportStrength')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('session')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={signOut} loading={signingOut}>
            <LogOut size={16} className="rtl:-scale-x-100" />
            {tn('signOut')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-danger">{t('danger')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-ink">{t('resetTitle')}</p>
            <p className="mt-1 text-sm text-ink-muted">{t('resetBody')}</p>
            <Button variant="danger" onClick={handleResetProgress} loading={resetting} className="mt-3">
              <RotateCcw size={16} />
              {confirmReset ? t('resetConfirm') : t('resetButton')}
            </Button>
          </div>

          <div className="border-t border-danger/20 pt-5">
            <p className="text-sm font-semibold text-ink">{t('deleteTitle')}</p>
            <p className="mt-1 text-sm text-ink-muted">{t('deleteBody')}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                aria-label={t('deleteTitle')}
                className="w-32 rounded-sm border border-line bg-bg px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-danger focus:outline-none"
              />
              <Button variant="danger" onClick={() => void handleDeleteAccount()} loading={deleting} disabled={deleteText !== 'DELETE'}>
                <Trash2 size={16} />
                {t('deleteButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

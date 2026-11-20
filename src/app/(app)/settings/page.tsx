'use client';

import { useState } from 'react';
import { BellRing, Download, FileJson, LogOut, RotateCcw, Trash2, Volume2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { SwitchRow } from '@/components/ui/switch';
import { useAuth } from '@/context/auth-context';
import { useProgress } from '@/context/progress-context';
import { useToast } from '@/components/ui/toast';
import { useProgram } from '@/hooks/use-program';
import { createClient } from '@/lib/supabase/client';
import { initials, todayKey } from '@/lib/utils';
import { EMPTY_PROGRESS, type UnitSystem } from '@/lib/types';
import { primeAudio, beep, speak, vibrate } from '@/lib/session-cues';
import { clearOfflinePageCache } from '@/lib/pwa';
import { writeLocalStorage } from '@/hooks/use-local-storage';
import { PHOTO_BUCKET } from '@/components/progress/progress-photos';
import {
  dailyReminderIcs,
  downloadFile,
  exportJson,
  measurementsCsv,
  strengthCsv,
  workoutLogCsv,
} from '@/lib/export';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm border border-line bg-bg px-4 py-3">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="font-mono text-sm text-ink">{children}</span>
    </div>
  );
}

function clearLocalForgeData(userId: string) {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('forge:')) localStorage.removeItem(key);
    }
  } catch {
    writeLocalStorage(`forge:unsaved-progress:${userId}`, null);
  }
}

export default function SettingsPage() {
  const { user, profile, updateLocalProfile, setProgramStartDate, signOut, signingOut } = useAuth();
  const { progress, settings, updateSettings } = useProgress();
  const { todayDayNumber, totalDays } = useProgram();
  const { toast } = useToast();

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
      toast('Could not save changes.', 'error');
      return;
    }
    updateLocalProfile({ full_name: fullName });
    toast('Profile updated.');
  };

  const handleSaveStartDate = async () => {
    if (!startDate || startDate > todayKey()) {
      toast('Pick a start date that is today or earlier.', 'error');
      return;
    }
    setSavingStart(true);
    const ok = await setProgramStartDate(startDate);
    setSavingStart(false);
    toast(ok ? 'Start date updated.' : 'Could not update the start date.', ok ? 'success' : 'error');
  };

  const handleResetProgress = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    const supabase = createClient();
    // Keep preferences (units, cues, goals) — only the training record is cleared.
    const fresh = { ...EMPTY_PROGRESS, settings: progress.settings, onboardingCompleted: true };
    const { error } = await supabase.from('user_progress').update({ data: fresh }).eq('user_id', user.id);
    const startOk = error ? false : await setProgramStartDate(todayKey());
    setResetting(false);
    setConfirmReset(false);
    if (error || !startOk) {
      toast('Could not reset progress.', 'error');
      return;
    }
    writeLocalStorage(`forge:unsaved-progress:${user.id}`, null);
    toast('Progress reset — Day 1 starts today. Refreshing…');
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    const supabase = createClient();

    // Storage objects can only be removed through the Storage API, so clear photos first.
    const { data: files } = await supabase.storage.from(PHOTO_BUCKET).list(user.id, { limit: 1000 });
    const paths = Array.from(
      new Set([
        ...progress.progressPhotos.map((p) => p.path),
        ...(files ?? []).map((f) => `${user.id}/${f.name}`),
      ])
    );
    if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);

    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      setDeleting(false);
      toast('Could not delete your account. The delete_own_account function may not be set up yet.', 'error');
      return;
    }
    await supabase.auth.signOut().catch(() => {});
    await clearOfflinePageCache();
    clearLocalForgeData(user.id);
    window.location.href = '/';
  };

  const downloadReminder = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    downloadFile(
      'forge-daily-reminder.ics',
      dailyReminderIcs(settings.reminderTime, totalDays - todayDayNumber + 1, siteUrl),
      'text/calendar'
    );
    toast('Open the downloaded file to add the reminder to your calendar.', 'info');
  };

  const stamp = todayKey();

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-ink-muted">Your account, preferences and data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forge-dim font-mono text-lg font-bold text-forge">
              {initials(profile?.full_name, user.email)}
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" value={user.email ?? ''} disabled />
            </div>
          </div>
          <Button onClick={handleSaveProfile} loading={saving} className="mt-4">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Units</p>
            <Segmented<UnitSystem>
              label="Units"
              options={[
                { id: 'metric', label: 'Metric (kg, cm)' },
                { id: 'imperial', label: 'Imperial (lb, in)' },
              ]}
              value={settings.units}
              onChange={(units) => updateSettings({ units })}
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Guided workout cues</p>
            <SwitchRow
              label="Sound"
              description="Beeps for the last 3 seconds and when a timer ends"
              checked={settings.sound}
              onChange={(sound) => {
                primeAudio();
                updateSettings({ sound });
                if (sound) beep(880, 120);
              }}
            />
            <SwitchRow
              label="Voice coach"
              description="Reads out each exercise, set and rest period"
              checked={settings.voice}
              onChange={(voice) => {
                updateSettings({ voice });
                if (voice) speak('Voice coach on.');
              }}
            />
            <SwitchRow
              label="Vibration"
              description="Buzzes when a set or rest ends (phones only)"
              checked={settings.vibration}
              onChange={(vibration) => {
                updateSettings({ vibration });
                if (vibration) vibrate(120);
              }}
            />
            <button
              onClick={() => {
                primeAudio();
                beep(660, 90);
                setTimeout(() => beep(990, 240), 300);
              }}
              className="mt-1 flex items-center gap-1.5 px-1 text-xs font-semibold text-forge hover:text-forge-hover"
            >
              <Volume2 size={13} /> Test sound
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted">
            Add a repeating reminder to your phone&apos;s calendar. It alerts you at the same time every day and links
            straight to that day&apos;s workout.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Input
                id="reminder-time"
                label="Time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => e.target.value && updateSettings({ reminderTime: e.target.value })}
              />
            </div>
            <Button variant="secondary" onClick={downloadReminder}>
              <BellRing size={16} />
              Add to Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Today">
            Day {todayDayNumber} of {totalDays}
          </Row>
          <Row label="Member since">
            {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </Row>
          <div className="rounded-sm border border-line bg-bg p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-44">
                <Input
                  id="program-start"
                  label="Program start date"
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
                Update
              </Button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Moving this shifts which program day is &ldquo;today&rdquo;. Workouts you&apos;ve logged stay attached to
              their day number.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted">Download a copy of everything you&apos;ve logged.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadFile(`forge-export-${stamp}.json`, exportJson(progress, profile), 'application/json')}
            >
              <FileJson size={14} /> Everything (JSON)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                downloadFile(
                  `forge-workouts-${stamp}.csv`,
                  workoutLogCsv(progress, profile?.program_start_date ?? stamp, todayDayNumber),
                  'text/csv'
                )
              }
            >
              <Download size={14} /> Workout log (CSV)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadFile(`forge-measurements-${stamp}.csv`, measurementsCsv(progress), 'text/csv')}
            >
              <Download size={14} /> Measurements (CSV)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadFile(`forge-strength-${stamp}.csv`, strengthCsv(progress), 'text/csv')}
            >
              <Download size={14} /> Strength tests (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={signOut} loading={signingOut}>
            <LogOut size={16} />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-danger">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-ink">Reset progress</p>
            <p className="mt-1 text-sm text-ink-muted">
              Clears all workout history, measurements, strength tests and habit data, and restarts the program at Day 1
              today. Your preferences are kept. This cannot be undone.
            </p>
            <Button variant="danger" onClick={handleResetProgress} loading={resetting} className="mt-3">
              <RotateCcw size={16} />
              {confirmReset ? 'Click again to confirm reset' : 'Reset All Progress'}
            </Button>
          </div>

          <div className="border-t border-danger/20 pt-5">
            <p className="text-sm font-semibold text-ink">Delete account</p>
            <p className="mt-1 text-sm text-ink-muted">
              Permanently deletes your account, all progress and your progress photos. Type{' '}
              <span className="font-mono text-danger">DELETE</span> to confirm.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
                aria-label="Type DELETE to confirm account deletion"
                className="w-32 rounded-sm border border-line bg-bg px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-danger focus:outline-none"
              />
              <Button
                variant="danger"
                onClick={() => void handleDeleteAccount()}
                loading={deleting}
                disabled={deleteText !== 'DELETE'}
              >
                <Trash2 size={16} />
                Delete My Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

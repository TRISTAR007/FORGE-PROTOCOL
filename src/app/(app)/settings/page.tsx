'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { initials } from '@/lib/utils';
import { LogOut, RotateCcw } from 'lucide-react';
import { EMPTY_PROGRESS } from '@/lib/types';

export default function SettingsPage() {
  const { user, profile, updateLocalProfile, signOut, signingOut } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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

  const handleResetProgress = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    const supabase = createClient();
    const { error } = await supabase.from('user_progress').update({ data: EMPTY_PROGRESS }).eq('user_id', user.id);
    setResetting(false);
    setConfirmReset(false);
    if (error) {
      toast('Could not reset progress.', 'error');
      return;
    }
    toast('Progress reset. Refreshing…');
    window.location.reload();
  };

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-ink-muted">Your account and program details.</p>
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
          <CardTitle>Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-sm border border-line bg-bg px-4 py-3">
            <span className="text-sm text-ink-muted">Program start date</span>
            <span className="font-mono text-sm text-ink">
              {profile?.program_start_date
                ? new Date(profile.program_start_date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-sm border border-line bg-bg px-4 py-3">
            <span className="text-sm text-ink-muted">Member since</span>
            <span className="font-mono text-sm text-ink">
              {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </span>
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
        <CardContent>
          <p className="text-sm text-ink-muted">
            This permanently clears all workout history, measurements, strength tests, and habit data for your
            account. This cannot be undone.
          </p>
          <Button variant="danger" onClick={handleResetProgress} loading={resetting} className="mt-4">
            <RotateCcw size={16} />
            {confirmReset ? 'Click again to confirm reset' : 'Reset All Progress'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthProvider } from '@/context/auth-context';
import { ProgressProvider } from '@/context/progress-context';
import { ToastProvider } from '@/components/ui/toast';
import { AppShell } from '@/components/layout/app-shell';
import { EMPTY_PROGRESS, type Profile, type ProgressData } from '@/lib/types';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the profile and progress at the same time instead of one after the other.
  const [{ data: existingProfile }, { data: existingProgress }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_progress').select('data, updated_at').eq('user_id', user.id).maybeSingle(),
  ]);
  let profile = existingProfile;

  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: (user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string) ?? (user.user_metadata?.picture as string) ?? null,
      })
      .select('*')
      .single();
    profile = created;
  }

  let progressRow = existingProgress;

  if (!progressRow) {
    const { data: created } = await supabase
      .from('user_progress')
      .insert({ user_id: user.id, data: EMPTY_PROGRESS })
      .select('data, updated_at')
      .single();
    progressRow = created;
  }

  const initialProgress: ProgressData = { ...EMPTY_PROGRESS, ...(progressRow?.data as Partial<ProgressData>) };

  return (
    <AuthProvider user={{ id: user.id, email: user.email ?? null }} profile={profile as Profile | null}>
      <ToastProvider>
        <ProgressProvider
          userId={user.id}
          initialData={initialProgress}
          initialUpdatedAt={(progressRow?.updated_at as string | undefined) ?? null}
        >
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

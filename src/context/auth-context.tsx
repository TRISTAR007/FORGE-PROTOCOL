'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearOfflinePageCache } from '@/lib/pwa';
import type { Profile } from '@/lib/types';

interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  updateLocalProfile: (patch: Partial<Profile>) => void;
  /** Saves a new program start date (YYYY-MM-DD). Resolves false if the save failed. */
  setProgramStartDate: (dateKey: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signingOut: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  profile,
  children,
}: {
  user: AuthUser;
  profile: Profile | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [localProfile, setLocalProfile] = useState<Profile | null>(profile);
  const [signingOut, setSigningOut] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile: localProfile,
      updateLocalProfile: (patch) =>
        setLocalProfile((prev) => (prev ? { ...prev, ...patch } : prev)),
      setProgramStartDate: async (dateKey) => {
        const supabase = createClient();
        const { error } = await supabase.from('profiles').update({ program_start_date: dateKey }).eq('id', user.id);
        if (error) return false;
        setLocalProfile((prev) => (prev ? { ...prev, program_start_date: dateKey } : prev));
        return true;
      },
      signOut: async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        await clearOfflinePageCache();
        router.push('/login');
        router.refresh();
      },
      signingOut,
    }),
    [user, localProfile, signingOut, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

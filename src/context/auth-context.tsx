'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  updateLocalProfile: (patch: Partial<Profile>) => void;
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
      signOut: async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
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

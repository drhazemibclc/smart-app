'use client';

import { useSession } from '@/lib/auth-client';

export function useAuth() {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    role: session?.user.role,
    isAuthenticated: !!session?.user
  };
}

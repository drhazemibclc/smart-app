'use client';

import React, { useContext, useMemo } from 'react';

// Import the Session type from your auth-client
import type { Session } from '../../lib/auth-client';
import { useSession } from '../../lib/auth-client';

// ------------ TYPES ------------
export type User = Session['user'];
type UserWithRole = User & { role: string };

export interface AuthSession {
  session: Session | null;
  user: UserWithRole | null;
  isLoading: boolean;
}

// ------------ CONTEXT ------------
const AuthContext = React.createContext<AuthSession | null>(null);

export function AuthProvider(props: React.PropsWithChildren) {
  const { data: session, isPending } = useSession();

  const authState = useMemo<AuthSession>(() => {
    if (session) {
      return {
        user: session.user as UserWithRole,
        session,
        isLoading: isPending
      };
    }
    return {
      user: null,
      session: null,
      isLoading: isPending
    };
  }, [session, isPending]);

  return <AuthContext.Provider value={authState}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthSession {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

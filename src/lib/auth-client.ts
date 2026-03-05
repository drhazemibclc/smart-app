'use client';

// 1. Remove 'console' import as it's built-in; remove unused 'error' import
import { sentinelClient } from '@better-auth/infra/client';
import { passkeyClient } from '@better-auth/passkey/client';
import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  magicLinkClient
} from 'better-auth/client/plugins';
import type { AccessControl } from 'better-auth/plugins/access'; // Specific path is safer
import { createAuthClient } from 'better-auth/react';

// Shared server types/logic
import type { auth } from '@/server/auth';
import { ac, roles, type UserRoles } from '@/server/auth/roles';

// Ensure your plugin definition doesn't include server-side logic
const adminPlugin = adminClient({
  ac: ac as unknown as AccessControl,
  roles
});

// 2. Fix the nested export and syntax
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  fetchOptions: {
    onError: (ctx) => {
      console.error('❌ Auth error:', ctx.error);
      if (ctx.error?.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    onSuccess: (ctx) => {
      console.log('✅ Auth request succeeded:', ctx.response?.url ?? 'unknown URL');
    }
  },
  plugins: [
    sentinelClient(),
    magicLinkClient(),
    passkeyClient(),
    inferAdditionalFields<typeof auth>(), // Correctly infer server schema
    customSessionClient<typeof auth>(),
    adminPlugin
  ]
});

// 3. Extract hooks and functions correctly
export const {
  useSession,
  signIn,
  signOut,
  signUp,
  updateUser,
  changePassword,
  changeEmail,
  deleteUser,
  revokeSession,
  resetPassword,
  linkSocial,
  listAccounts,
  listSessions,
  revokeOtherSessions,
  revokeSessions
} = authClient;

/**
 * Custom auth hook for convenient access to session state
 */
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const status = isPending ? 'loading' : session ? 'authenticated' : 'unauthenticated';

  return {
    error,
    isAuthenticated: !!session,
    isLoading: isPending,
    session: session ?? null,
    status,
    role: session?.user?.role as UserRoles | undefined,
    user: session?.user ?? null
  };
}

/**
 * Client-side permission checker
 */
export const hasPermission = (permissions: Record<string, string[]>, role: UserRoles) => {
  return authClient.admin.checkRolePermission({
    permissions,
    role
  });
};

export type Session = typeof authClient.$Infer.Session;

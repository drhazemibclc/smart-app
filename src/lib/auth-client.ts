'use client';

import { passkeyClient } from '@better-auth/passkey/client';
import { adminClient, customSessionClient, inferAdditionalFields, magicLinkClient } from 'better-auth/client/plugins';
import type { AccessControl } from 'better-auth/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@/server/auth';
import { ac, roles, type UserRoles } from '@/server/auth/roles';

// Build the plugin separately with type assertion
const adminPlugin = adminClient({
  ac: ac as unknown as AccessControl,
  roles
});

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  fetchOptions: {
    onError: ctx => {
      console.error('❌ Auth error:', ctx.error);

      // Check if it's a 401 error
      if (ctx.error?.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    onSuccess: ctx => {
      console.log('✅ Auth request succeeded:', ctx.response?.url ?? 'unknown URL');
    }
  },

  plugins: [
    magicLinkClient(),
    passkeyClient(),
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
    adminPlugin
  ]
});

// Extract hooks and functions
export const { useSession } = authClient;
export const {
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

// Custom auth hook
export function useAuth() {
  const { data: session, isPending, error } = useSession();

  const status = isPending ? 'loading' : session ? 'authenticated' : 'unauthenticated';

  return {
    error,
    isAuthenticated: status === 'authenticated',
    isLoading: isPending,
    session: session ?? null,
    status,
    role: session?.user?.role,
    user: session?.user ?? null
  };
}

// Permission checker utility - use authClient.admin directly
export const hasPermission = (permissions: Record<string, string[]>, role: UserRoles) => {
  return authClient.admin.checkRolePermission({
    permissions,
    role: role
  });
};

export type Session = typeof authClient.$Infer.Session;

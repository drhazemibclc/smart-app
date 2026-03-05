import { headers } from 'next/headers';
import { cache } from 'react';

import { auth, type Session, type User } from '@/server/auth';

import { prisma } from '../db';

export type Context = {
  session: Session | null;
  user: User | null;
  clinicId?: string | undefined;
  db: typeof prisma;
  headers: Headers;
};

export const createTRPCContext = cache(async () => {
  const session = (await auth.api.getSession({ headers: await headers() })) as Session | null;

  const user = (session?.user ?? null) as User | null;
  const clinicId = user?.clinic?.id;
  return {
    session,
    user,
    clinicId,
    db: prisma,
    headers: (await headers()) as Headers
  };
});

export type ContextType = ReturnType<typeof createTRPCContext>;

import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

import { auth, type Session, type User } from '@/server/auth';

import { prisma } from '../db';

export type Context = {
  session: Session | null;
  user: User | null;
  clinicId?: string | undefined;
  db: typeof prisma;
  headers: Headers;
};

export async function createTRPCContext(req: NextRequest): Promise<Context> {
  const session = (await auth.api.getSession({ headers: req.headers })) as Session | null;

  const user = (session?.user ?? null) as User | null;
  const clinicId = (user?.clinic?.id as string | undefined) ?? undefined;

  return {
    session,
    user,
    clinicId,
    db: prisma,
    headers: (await headers()) as Headers
  };
}

export type ContextType = ReturnType<typeof createTRPCContext>;

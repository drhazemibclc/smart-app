import { createCallerFactory } from '@/server/api';
import type { Context } from '@/server/api/context';
import { appRouter } from '@/server/api/routers';
import type { Session, User } from '@/server/auth';

import type { db } from '../server/db';

/**
 * Create a mock context for testing tRPC routers
 */
export function createMockContext(overrides?: Partial<Context>): Context {
  return {
    session: null,
    user: null,
    clinicId: undefined,
    db: {} as typeof db,
    headers: new Headers(),
    ...overrides
  };
}

/**
 * Create a mock authenticated user
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'DOCTOR',
    clinic: {
      id: 'test-clinic-id',
      name: 'Test Clinic'
    },
    ...overrides
  } as User;
}

/**
 * Create a mock session
 */
export function createMockSession(user?: User): Session {
  const mockUser = user || createMockUser();
  return {
    user: mockUser,
    session: {
      id: 'test-session-id',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      token: 'test-token',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } as unknown as Session;
}

/**
 * Create a tRPC caller for testing
 */
export function createCaller(ctx: Context) {
  const factory = createCallerFactory(appRouter);
  return factory(ctx);
}

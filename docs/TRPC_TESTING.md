# Testing tRPC Routers

## Overview

This guide covers how to test tRPC routers in your Next.js 16 project using Vitest. Since you're using tRPC v11 with the Options Proxy pattern, testing requires creating a caller with a mocked context.

## Important Note

Due to complex import chains with Prisma-generated types and Zod schemas, you may encounter import resolution issues when testing tRPC routers directly. The recommended approaches are:

1. **Test business logic separately** - Extract logic into service layers and test those
2. **Use integration tests** - Test the full stack with a test database
3. **Use placeholder tests** - Document the testing patterns without full execution

See the [Troubleshooting](#troubleshooting) section for details on resolving import issues.

## Key Concepts

- **Server-side callers**: Use `createCallerFactory` to create a testable instance of your router
- **Mock context**: Create a mock context with necessary dependencies (db, session, user)
- **Isolation**: Test routers in isolation without hitting real database or auth

## Setup

### 1. Create Test Utilities

Create a helper file for tRPC testing utilities:

```typescript
// src/test/trpc-helpers.ts
import { type Session, type User } from '@/server/auth';
import { createCallerFactory } from '@/server/api';
import type { Context } from '@/server/api/context';
import { appRouter } from '@/server/api/routers';
import { vi } from 'vitest';

/**
 * Create a mock context for testing tRPC routers
 */
export function createMockContext(overrides?: Partial<Context>): Context {
  return {
    session: null,
    user: null,
    clinicId: undefined,
    db: {} as any, // Mock Prisma client
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
  return {
    user: user || createMockUser(),
    session: {
      id: 'test-session-id',
      userId: user?.id || 'test-user-id',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      token: 'test-token',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    }
  } as Session;
}

/**
 * Create a tRPC caller for testing
 */
export function createCaller(ctx: Context) {
  const factory = createCallerFactory(appRouter);
  return factory(ctx);
}
```

### 2. Update Test Setup

Add tRPC-specific mocks to your test setup:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn()
  }))
}));
```

## Testing Patterns

### 1. Testing Public Procedures

Test procedures that don't require authentication:

```typescript
// src/server/api/routers/health.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createCaller, createMockContext } from '@/test/trpc-helpers';

describe('healthRouter', () => {
  it('returns OK for health check', async () => {
    const ctx = createMockContext();
    const caller = createCaller(ctx);

    const result = await caller.health.healthCheck();

    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String)
    });
  });

  it('checks database connection', async () => {
    const mockDb = {
      $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }])
    };

    const ctx = createMockContext({ db: mockDb as any });
    const caller = createCaller(ctx);

    const result = await caller.health.database();

    expect(result.database).toBe('connected');
    expect(mockDb.$queryRaw).toHaveBeenCalled();
  });
});
```

### 2. Testing Protected Procedures

Test procedures that require authentication:

```typescript
// src/server/api/routers/user.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createCaller, createMockContext, createMockSession, createMockUser } from '@/test/trpc-helpers';

describe('userRouter', () => {
  describe('getCurrent', () => {
    it('returns current user when authenticated', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const ctx = createMockContext({
        session: mockSession,
        user: mockUser
      });

      const caller = createCaller(ctx);
      const result = await caller.user.getCurrent();

      expect(result).toEqual(mockUser);
    });

    it('throws UNAUTHORIZED when not authenticated', async () => {
      const ctx = createMockContext(); // No session
      const caller = createCaller(ctx);

      await expect(caller.user.getCurrent()).rejects.toThrow(TRPCError);
      await expect(caller.user.getCurrent()).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const mockDb = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            image: null,
            phone: null,
            role: mockUser.role,
            createdAt: new Date()
          })
        }
      };

      const ctx = createMockContext({
        session: mockSession,
        user: mockUser,
        db: mockDb as any
      });

      const caller = createCaller(ctx);
      const result = await caller.user.getProfile();

      expect(result
        }
      };

      const ctx = createMockContext({
        session: mockSession,
        user: mockUser,
        db: mockDb as any
      });

      const caller = createCaller(ctx);

      await expect(caller.user.getProfile()).rejects.toMatchObject({
        code: 'NOT_FOUND'
      });
    });
  });
});
```

### 3. Testing Mutations

Test procedures that modify data:

```typescript
// src/server/api/routers/patient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createCaller, createMockContext, createMockSession, createMockUser } from '@/test/trpc-helpers';

describe('patientRouter', () => {
  describe('create', () => {
    it('creates a new patient', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      const mockPatient = {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'MALE',
        clinicId: mockUser.clinic.id
      };

      const mockDb = {
        patient: {
          create: vi.fn().mockResolvedValue(mockPatient)
        },
        clinicMember: {
          findFirst: vi.fn().mockResolvedValue({
            userId: mockUser.id,
            clinicId: mockUser.clinic.id,
            role: 'DOCTOR'
          })
        }
      };

      const ctx = createMockContext({
        session: mockSession,
        user: mockUser,
        clinicId: mockUser.clinic.id,
        db: mockDb as any
      });

      const caller = createCaller(ctx);
      const result = await caller.patient.create({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        gender: 'MALE'
      });

      expect(result).toEqual(mockPatient);
      expect(mockDb.patient.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          clinicId: mockUser.clinic.id
        })
      });
    });

    it('validates input data', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const ctx = createMockContext({
        session: mockSession,
        user: mockUser
      });

      const caller = createCaller(ctx);

      // Missing required fields
      await expect(
        caller.patient.create({
          firstName: '',
          lastName: 'Doe'
        } as any)
      ).rejects.toThrow();
    });
  });
});
```

### 4. Testing with Clinic/Role Middleware

Test procedures that require specific roles:

```typescript
// src/server/api/routers/admin.test.ts
import { describe, it, expect } from 'vitest';
import { createCaller, createMockContext, createMockSession, createMockUser } from '@/test/trpc-helpers';

describe('adminRouter', () => {
  it('allows admin users', async () => {
    const mockUser = createMockUser({ role: 'ADMIN' });
    const mockSession = createMockSession(mockUser);
    const mockDb = {
      user: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };

    const ctx = createMockContext({
      session: mockSession,
      user: mockUser,
      db: mockDb as any
    });

    const caller = createCaller(ctx);
    const result = await caller.admin.getAllUsers();

    expect(result).toEqual([]);
  });

  it('blocks non-admin users', async () => {
    const mockUser = createMockUser({ role: 'DOCTOR' });
    const mockSession = createMockSession(mockUser);
    const ctx = createMockContext({
      session: mockSession,
      user: mockUser
    });

    const caller = createCaller(ctx);

    await expect(caller.admin.getAllUsers()).rejects.toMatchObject({
      code: 'FORBIDDEN'
    });
  });
});
```

### 5. Testing Queries with Pagination

```typescript
// src/server/api/routers/appointment.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createCaller, createMockContext, createMockSession, createMockUser } from '@/test/trpc-helpers';

describe('appointmentRouter', () => {
  describe('list', () => {
    it('returns paginated appointments', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      const mockAppointments = [
        { id: '1', patientId: 'p1', date: new Date(), status: 'SCHEDULED' },
        { id: '2', patientId: 'p2', date: new Date(), status: 'COMPLETED' }
      ];

      const mockDb = {
        appointment: {
          findMany: vi.fn().mockResolvedValue(mockAppointments),
          count: vi.fn().mockResolvedValue(2)
        },
        clinicMember: {
          findFirst: vi.fn().mockResolvedValue({
            userId: mockUser.id,
            clinicId: mockUser.clinic.id,
            role: 'DOCTOR'
          })
        }
      };

      const ctx = createMockContext({
        session: mockSession,
        user: mockUser,
        clinicId: mockUser.clinic.id,
        db: mockDb as any
      });

      const caller = createCaller(ctx);
      const result = await caller.appointment.list({
        page: 1,
        limit: 10
      });

      expect(result.items).toEqual(mockAppointments);
      expect(result.total).toBe(2);
      expect(mockDb.appointment.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          clinicId: mockUser.clinic.id
        }),
        skip: 0,
        take: 10,
        orderBy: expect.any(Object)
      });
    });
  });
});
```

## Best Practices

1. **Mock the database**: Always mock Prisma client methods to avoid hitting the real database
2. **Test authorization**: Verify that protected procedures throw appropriate errors
3. **Test validation**: Ensure Zod schemas reject invalid input
4. **Test edge cases**: Include tests for null values, empty arrays, etc.
5. **Use descriptive names**: Test names should clearly describe what they test
6. **Isolate tests**: Each test should be independent and not rely on others
7. **Mock external services**: Mock Redis, email services, file uploads, etc.
8. **Consider service layer testing**: Extract business logic into services and test those separately (see example below)

## Alternative Approach: Testing Service Layer

Instead of testing tRPC routers directly, you can extract business logic into service functions and test those. This avoids complex import chains and makes tests more focused:

```typescript
// src/server/db/services/user.service.ts
export const userService = {
  async getUserById(db: PrismaClient, userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
  }
};

// src/server/db/services/user.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { userService } from './user.service';

describe('userService', () => {
  it('returns user by id', async () => {
    const mockDb = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com'
        })
      }
    };

    const result = await userService.getUserById(mockDb as any, 'user-1');

    expect(result).toMatchObject({
      id: 'user-1',
      name: 'John Doe'
    });
    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: expect.any(Object)
    });
  });
});
```

Then your tRPC router simply calls the service:

```typescript
// src/server/api/routers/user.ts
export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await userService.getUserById(ctx.db, input.id);
    })
});
```

See `src/server/db/services/example.service.test.ts` for a complete working example.

## Running Tests

```bash
# Run all tRPC router tests
bunx vitest run src/server/api/routers/

# Run specific router tests
bunx vitest run src/server/api/routers/user.test.ts

# Run with verbose output
bunx vitest run --reporter=verbose src/server/api/routers/

# Watch mode for development
bunx vitest src/server/api/routers/
```

## Common Patterns

### Testing Error Handling

```typescript
it('handles database errors gracefully', async () => {
  const mockDb = {
    patient: {
      findUnique: vi.fn().mockRejectedValue(new Error('Database error'))
    }
  };

  const ctx = createMockContext({
    session: mockSession,
    user: mockUser,
    db: mockDb as any
  });

  const caller = createCaller(ctx);

  await expect(caller.patient.getById({ id: 'patient-1' })).rejects.toThrow('Database error');
});
```

### Testing with Multiple Mocks

```typescript
it('creates appointment with notifications', async () => {
  const mockDb = {
    appointment: {
      create: vi.fn().mockResolvedValue(mockAppointment)
    },
    notification: {
      create: vi.fn().mockResolvedValue(mockNotification)
    },
    clinicMember: {
      findFirst: vi.fn().mockResolvedValue(mockMember)
    }
  };

  const ctx = createMockContext({
    session: mockSession,
    user: mockUser,
    db: mockDb as any
  });

  const caller = createCaller(ctx);
  await caller.appointment.create(appointmentData);

  expect(mockDb.appointment.create).toHaveBeenCalled();
  expect(mockDb.notification.create).toHaveBeenCalled();
});
```

## Troubleshooting

### Issue: "Failed to resolve import @/prisma/types"

This is a known issue with Vite's import analysis when testing tRPC routers that have complex import chains through Prisma-generated types.

**Solutions:**

1. **Run Prisma Generate First**
   ```bash
   npm run db:generate
   bunx vitest run
   ```

2. **Test Business Logic Separately**
   Instead of testing the entire tRPC router, test the business logic in service layers:
   ```typescript
   // src/server/db/services/user.service.test.ts
   import { userService } from './user.service';

   describe('userService', () => {
     it('creates user', async () => {
       const mockDb = { user: { create: vi.fn() } };
       await userService.create(mockDb, userData);
       expect(mockDb.user.create).toHaveBeenCalled();
     });
   });
   ```

3. **Use Integration Tests**
   For full end-to-end testing, use integration tests with a test database instead of unit tests.

4. **Mock the Router Import**
   If you must test the router, you can mock the problematic imports in your test setup:
   ```typescript
   // src/test/setup.ts
   vi.mock('@/zodSchemas/helpers/enums', () => ({
     roleSchema: vi.fn(),
     statusSchema: vi.fn()
     // ... other exports
   }));
   ```

### Issue: "Cannot read property 'user' of null"

Make sure you're providing a complete mock context with session and user:

```typescript
const ctx = createMockContext({
  session: createMockSession(),
  user: createMockUser()
});
```

### Issue: "Middleware throws UNAUTHORIZED"

Protected procedures require both session and user in the context:

```typescript
const mockUser = createMockUser();
const ctx = createMockContext({
  session: createMockSession(mockUser),
  user: mockUser // Don't forget this!
});
```

### Issue: "Database method not mocked"

Mock all Prisma methods your procedure uses:

```typescript
const mockDb = {
  patient: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
};
```

## Example: Complete Test File

```typescript
// src/server/api/routers/todo.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCaller, createMockContext, createMockSession, createMockUser } from '@/test/trpc-helpers';

describe('todoRouter', () => {
  let mockDb: any;
  let mockUser: any;
  let mockSession: any;

  beforeEach(() => {
    mockUser = createMockUser();
    mockSession = createMockSession(mockUser);
    mockDb = {
      todo: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }
    };
  });

  describe('getAll', () => {
    it('returns all todos', async () => {
      const mockTodos = [
        { id: '1', title: 'Test 1', completed: false },
        { id: '2', title: 'Test 2', completed: true }
      ];

      mockDb.todo.findMany.mockResolvedValue(mockTodos);

      const ctx = createMockContext({ db: mockDb });
      const caller = createCaller(ctx);
      const result = await caller.todo.getAll();

      expect(result).toEqual(mockTodos);
      expect(mockDb.todo.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('create', () => {
    it('creates a new todo', async () => {
      const newTodo = { id: '1', title: 'New Todo', completed: false };
      mockDb.todo.create.mockResolvedValue(newTodo);

      const ctx = createMockContext({ db: mockDb });
      const caller = createCaller(ctx);
      const result = await caller.todo.create({ title: 'New Todo' });

      expect(result).toEqual(newTodo);
      expect(mockDb.todo.create).toHaveBeenCalledWith({
        data: { title: 'New Todo', completed: false }
      });
    });

    it('validates input', async () => {
      const ctx = createMockContext({ db: mockDb });
      const caller = createCaller(ctx);

      await expect(caller.todo.create({ title: '' })).rejects.toThrow();
    });
  });
});
```

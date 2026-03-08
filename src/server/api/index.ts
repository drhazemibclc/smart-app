import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { sanitizeObject, trpcLogger } from '@/logger';

import type { LogType } from '../../logger/types';
import { enhancedErrorFormatter } from '../utils/validation';
import type { Context } from './context';

interface LoggingMiddlewareOptions {
  logParams?: boolean;
  logResult?: boolean;
  logError?: boolean;
}

const defaultOptions: LoggingMiddlewareOptions = {
  logParams: true,
  logResult: process.env.NODE_ENV === 'development',
  logError: true
};

// Initialize tRPC with proper typing
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: enhancedErrorFormatter
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

export const procedure = t.procedure;
export const createTRPCRouter = t.router;
export const router = t.router;
/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
const authMiddleware = t.middleware(({ next, ctx }) => {
  if (!(ctx.user && ctx.session)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User session not found or expired'
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session } });
});
const adminMiddleware = t.middleware(async ({ next, ctx }) => {
  const { user } = ctx;
  if (!user) {
    console.log('Admin middleware: No session found');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  if (user.role !== 'ADMIN') {
    console.log('Admin middleware: User is not admin, role:', user.role);
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }

  return next({ ctx: { ...ctx, user } });
});

// export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
export const adminProcedure = t.procedure.use(adminMiddleware);

const clinicAccessMiddleware = t.middleware(async ({ ctx, next }) => {
  const userClinicId = ctx.user?.clinic?.id;
  const userId = ctx.user?.id;

  if (!(userClinicId && userId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Clinic access required or user session missing'
    });
  }

  // Use the verified userId from context
  const clinicMember = await ctx.db.clinicMember.findFirst({
    where: {
      userId,
      clinicId: userClinicId
      // Ensure the member isn't deleted if you use soft deletes
    }
  });

  if (!clinicMember) {
    console.error(`Access Denied: User ${userId} is not a member of Clinic ${userClinicId}`);
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No access to this clinic'
    });
  }

  return next({
    ctx: {
      ...ctx,
      role: (clinicMember.role as string) || 'STAFF'
    }
  });
});

/**
 * Middleware factory for role-based access control
 */
const createRoleMiddleware = (allowedRoles: string[]) =>
  t.middleware(({ ctx, next }) => {
    const userRole = ctx.user?.role;

    if (!(userRole && allowedRoles.includes(userRole))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole
      }
    });
  });
/**
 * Cached procedure factory for pediatric data
 */
export const clinicProcedure = publicProcedure.use(authMiddleware).use(clinicAccessMiddleware);

// Role-specific procedures
export const doctorProcedure = clinicProcedure.use(createRoleMiddleware(['DOCTOR', 'ADMIN']));
export const staffProcedure = clinicProcedure.use(createRoleMiddleware(['STAFF', 'DOCTOR', 'ADMIN']));
export function loggingMiddleware(opts: LoggingMiddlewareOptions = {}) {
  const options = { ...defaultOptions, ...opts };

  return t.middleware(async ({ path, type, next, input, ctx }) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    const logger = trpcLogger.child({
      requestId,
      path
    });

    // Log incoming request
    if (options.logParams) {
      logger.debug('tRPC request started', {
        input: sanitizeObject(input),
        type: type as LogType,
        ...(ctx?.user && { userId: ctx.user.id })
      });
    } else {
      logger.debug('tRPC request started');
    }

    try {
      const result = await next();

      const duration = Date.now() - start;

      // Log successful request
      if (result.ok) {
        logger.info('tRPC request completed', {
          duration,
          ...(options.logResult && { result: sanitizeObject(result.data) })
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      // Log error
      if (options.logError) {
        const trpcError = error as TRPCError;
        logger.error(
          'tRPC request failed',
          {
            duration,
            code: trpcError.code,
            cause: trpcError.cause,
            ...(options.logParams && { input: sanitizeObject(input) })
          },
          error instanceof Error ? error : undefined
        );
      }

      throw error;
    }
  });
}

// Performance monitoring middleware
export const performanceMiddleware = t.middleware(async ({ path, next }) => {
  const start = Date.now();
  const memoryBefore = process.memoryUsage?.();
  const result = await next();

  const duration = Date.now() - start;
  const memoryAfter = process.memoryUsage?.();

  if (duration > 1000) {
    // Log slow queries
    trpcLogger.warn('Slow tRPC request detected', {
      path,
      duration,
      memoryDelta:
        memoryAfter && memoryBefore
          ? {
              heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
              heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal
            }
          : undefined
    });
  }

  return result;
});

// Request ID middleware
export const requestIdMiddleware = t.middleware(({ ctx, next }) => {
  const requestId = ctx.headers?.get('x-request-id') || crypto.randomUUID();

  return next({
    ctx: {
      ...ctx,
      requestId,
      logger: trpcLogger.child({ requestId })
    }
  });
});

// Export t instance and router for convenience
export const { middleware } = t;

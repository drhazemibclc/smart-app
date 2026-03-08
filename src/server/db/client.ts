import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // Ensure 'pg' is installed

import { env } from '@/env/server';
import type { Prisma } from '@/generated/prisma/client';
import { PrismaClient } from '@/generated/prisma/client';
import { dbLogger } from '@/logger';

/**
 * 1. Connection Pool Configuration
 * Standardizing the pool for the Postgres adapter.
 */
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

/**
 * 2. Type-safe Global Singleton
 */
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    adapter,
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' }
    ]
  });

  const isDev = process.env.NODE_ENV === 'development';

  // --- EVENT LOGGING ---

  client.$on('query' as never, (e: Prisma.QueryEvent) => {
    dbLogger.debug('Prisma Query', {
      query: isDev ? e.query : '[REDACTED]',
      params: isDev ? e.params : '[REDACTED]',
      duration: e.duration,
      target: e.target
    });
  });

  client.$on('error' as never, (e: Prisma.LogEvent) => {
    dbLogger.error('Prisma Error', {
      message: e.message,
      target: e.target
    });
  });

  client.$on('info' as never, (e: Prisma.LogEvent) => {
    dbLogger.info('Prisma Info', { message: e.message });
  });

  client.$on('warn' as never, (e: Prisma.LogEvent) => {
    dbLogger.warn('Prisma Warning', { message: e.message });
  });

  // --- MIDDLEWARE ---
  // Fixed the 'next' parameter type and the duration logging

  client.$use(async (params, next) => {
    const start = Date.now();
    try {
      const result = await next(params);
      const duration = Date.now() - start;

      if (isDev || duration > 100) {
        dbLogger.info(`Prisma ${params.model ?? 'System'}.${params.action}`, {
          model: params.model,
          action: params.action,
          duration: duration
        });
      }
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      dbLogger.error(`Prisma Error: ${params.model ?? 'System'}.${params.action}`, {
        model: params.model,
        action: params.action,
        duration: duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  });

  return client;
};

// Global management for HMR
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export const db = prisma;

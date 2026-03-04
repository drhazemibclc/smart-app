/**
 * Session Manager for Next.js with local Redis
 * Handles session storage, retrieval, and management
 */

import { randomBytes } from 'node:crypto';

import { cookies } from 'next/headers';
import { cache } from 'react';

import logger from '@/logger';

import { redis } from './client';
import { keys } from './config';

export interface SessionData {
  clinicId?: string;
  ipAddress?: string;
  lastActivity: Date;
  metadata?: Record<string, unknown>;
  permissions: string[];
  role: string;
  userAgent?: string;
  userId: string;
}

export interface SessionOptions {
  /** Session TTL in seconds (default: 24h) */
  ttl?: number;
  /** Session cookie name (default: 'pediacare.session') */
  cookieName?: string;
  /** Whether session is secure (HTTPS only) */
  secure?: boolean;
}

class SessionManager {
  private readonly defaultTTL = 86_400; // 24 hours
  private readonly defaultCookieName = 'pediacare.session';
  private readonly options: Required<SessionOptions>;

  constructor(options: SessionOptions = {}) {
    this.options = {
      ttl: options.ttl ?? this.defaultTTL,
      cookieName: options.cookieName ?? this.defaultCookieName,
      secure: options.secure ?? process.env.NODE_ENV === 'production'
    };
  }

  /**
   * Generate a secure random session ID
   */
  generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Get session ID from cookies (Server Component)
   */
  async getSessionIdFromCookies(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      return cookieStore.get(this.options.cookieName)?.value ?? null;
    } catch (error) {
      logger.error('[Session] Failed to get session ID from cookies', { error });
      return null;
    }
  }

  /**
   * Set session cookie (Server Action/Route Handler)
   */
  async setSessionCookie(sessionId: string): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set({
        name: this.options.cookieName,
        value: sessionId,
        httpOnly: true,
        secure: this.options.secure,
        sameSite: 'lax',
        path: '/',
        maxAge: this.options.ttl
      });
    } catch (error) {
      logger.error('[Session] Failed to set session cookie', { error });
    }
  }

  /**
   * Delete session cookie
   */
  async deleteSessionCookie(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.options.cookieName);
    } catch (error) {
      logger.error('[Session] Failed to delete session cookie', { error });
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    data: Omit<SessionData, 'lastActivity'>,
    sessionId: string = this.generateSessionId()
  ): Promise<string> {
    try {
      const key = keys.session(sessionId);
      const userSessionsKey = keys.userSessions(data.userId);

      const sessionData: SessionData = {
        ...data,
        lastActivity: new Date()
      };

      const pipeline = redis.pipeline();

      pipeline.setex(key, this.options.ttl, JSON.stringify(sessionData));
      pipeline.sadd(userSessionsKey, sessionId);
      pipeline.expire(userSessionsKey, this.options.ttl);

      await pipeline.exec();

      // Set cookie
      await this.setSessionCookie(sessionId);

      logger.info(`[Session] Created session ${sessionId} for user ${data.userId}`);
      return sessionId;
    } catch (error) {
      logger.error('[Session] Failed to create session', { error });
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get session data by ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const key = keys.session(sessionId);
      const data = await redis.get(key);

      if (!data) {
        return null;
      }

      const session = JSON.parse(data) as SessionData;

      // Update last activity and TTL
      await this.touchSession(sessionId);

      return session;
    } catch (error) {
      logger.error(`[Session] Failed to get session ${sessionId}`, { error });
      return null;
    }
  }

  /**
   * Get current session from cookies
   */
  async getCurrentSession(): Promise<SessionData | null> {
    const sessionId = await this.getSessionIdFromCookies();
    if (!sessionId) return null;
    return this.getSession(sessionId);
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    try {
      const existing = await this.getSession(sessionId);
      if (!existing) {
        return false;
      }

      const updated: SessionData = {
        ...existing,
        ...data,
        lastActivity: new Date()
      };

      await redis.setex(keys.session(sessionId), this.options.ttl, JSON.stringify(updated));

      logger.debug(`[Session] Updated session ${sessionId}`);
      return true;
    } catch (error) {
      logger.error(`[Session] Failed to update session ${sessionId}`, { error });
      return false;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);

      const pipeline = redis.pipeline();
      pipeline.del(keys.session(sessionId));

      if (session?.userId) {
        pipeline.srem(keys.userSessions(session.userId), sessionId);
      }

      await pipeline.exec();

      // Delete cookie if this is the current session
      const currentSessionId = await this.getSessionIdFromCookies();
      if (currentSessionId === sessionId) {
        await this.deleteSessionCookie();
      }

      logger.info(`[Session] Deleted session ${sessionId}`);
      return true;
    } catch (error) {
      logger.error(`[Session] Failed to delete session ${sessionId}`, { error });
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = keys.userSessions(userId);
      const sessionIds = await redis.smembers(userSessionsKey);

      if (sessionIds.length) {
        const pipeline = redis.pipeline();

        for (const id of sessionIds) {
          pipeline.del(keys.session(id));
        }

        pipeline.del(userSessionsKey);
        await pipeline.exec();
      }

      logger.info(`[Session] Deleted ${sessionIds.length} sessions for user ${userId}`);
      return sessionIds.length;
    } catch (error) {
      logger.error(`[Session] Failed to delete user sessions for ${userId}`, { error });
      return 0;
    }
  }

  /**
   * Touch session (update TTL)
   */
  async touchSession(sessionId: string): Promise<boolean> {
    try {
      await redis.expire(keys.session(sessionId), this.options.ttl);
      return true;
    } catch (error) {
      logger.error(`[Session] Failed to touch session ${sessionId}`, { error });
      return false;
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessionIds = await redis.smembers(keys.userSessions(userId));
      const sessions = await Promise.all(sessionIds.map((id: string) => this.getSession(id)));

      return sessions.filter((s: SessionData | null): s is SessionData => s !== null);
    } catch (error) {
      logger.error(`[Session] Failed to get user sessions for ${userId}`, { error });
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      let cursor = '0';
      let cleaned = 0;

      do {
        const [nextCursor, foundKeys] = await redis.scan(cursor, 'MATCH', keys.session('*'), 'COUNT', 100);

        for (const key of foundKeys) {
          const exists = await redis.exists(key);
          if (!exists) {
            cleaned++;
          }
        }

        cursor = nextCursor;
      } while (cursor !== '0');

      logger.info(`[Session] Cleaned up ${cleaned} expired sessions`);
      return cleaned;
    } catch (error) {
      logger.error('[Session] Failed to cleanup expired sessions', { error });
      return 0;
    }
  }

  /**
   * Get active sessions count
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      let cursor = '0';
      let count = 0;

      do {
        const [nextCursor, foundKeys] = await redis.scan(cursor, 'MATCH', keys.session('*'), 'COUNT', 1000);

        count += foundKeys.length;
        cursor = nextCursor;
      } while (cursor !== '0');

      return count;
    } catch (error) {
      logger.error('[Session] Failed to get active sessions count', { error });
      return 0;
    }
  }

  /**
   * Verify session is valid
   */
  async verifySession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session !== null;
  }
}

// Create default session manager instance
export const sessionManager = new SessionManager();

// React cache for per-request session in Server Components
export const getServerSession = cache(async () => {
  return sessionManager.getCurrentSession();
});

// Server Action wrapper with session
export async function withSession<T>(action: (session: SessionData) => Promise<T>): Promise<T> {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return action(session);
}

// API Route handler wrapper
export function withSessionRoute(handler: (session: SessionData) => Promise<Response>) {
  return async (req: Request) => {
    const sessionId = req.headers
      .get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('pediacare.session='))
      ?.split('=')[1];

    if (!sessionId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const session = await sessionManager.getSession(sessionId);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    return handler(session);
  };
}

export default sessionManager;

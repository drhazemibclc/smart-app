// lib/analytics/analytics.service.ts
import type { AnalyticsConfig, EnrichedAnalyticsEvent } from './types';

export class AnalyticsService {
  private readonly sessionId: string;
  private events: EnrichedAnalyticsEvent[] = [];
  private readonly config: Required<AnalyticsConfig>;
  private flushTimer: NodeJS.Timeout | null = null;
  private userId?: string;
  private isServer: boolean;

  constructor(config: AnalyticsConfig = {}) {
    this.isServer = typeof window === 'undefined';

    this.config = {
      endpoint: config.endpoint || '/api/analytics',
      sampleRate: config.sampleRate || 1,
      debug: config.debug || (!this.isServer && process.env.NODE_ENV === 'development'),
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000
    };

    this.sessionId = this.generateSessionId();

    if (!this.isServer) {
      this.setupFlushTimer();
      this.setupUnloadHandler();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private setupFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  private setupUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.destroy();
      });
    }
  }

  setUserId(id: string): void {
    this.userId = id;
  }

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    // Don't track on server
    if (this.isServer) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    const event: EnrichedAnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname
    };

    this.events.push(event);

    if (this.config.debug) {
      console.log('[Analytics]', {
        eventName: event.eventName,
        properties: event.properties,
        timestamp: event.timestamp.toISOString()
      });
    }

    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackPageView(path?: string, referrer?: string): void {
    if (this.isServer) return;

    this.trackEvent('page_view', {
      path: path || window.location.pathname,
      referrer: referrer || document.referrer
    });
  }

  async flush(): Promise<void> {
    if (this.isServer || this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    if (this.config.debug) {
      console.log('[Analytics] Flushing', eventsToSend.length, 'events');
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend.map(event => ({
            ...event,
            timestamp: event.timestamp.toISOString()
          })),
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        }),
        keepalive: true // Important for beforeunload
      });

      if (!response.ok && this.config.debug) {
        console.error('[Analytics] Failed to send events:', response.status, response.statusText);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics] Error sending events:', error);
      }
      // Re-queue events on failure
      this.events.unshift(...eventsToSend);
    }
  }

  // Clean up on page unload
  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

// Create singleton instance only on client side
export const analytics =
  typeof window !== 'undefined'
    ? new AnalyticsService({
        endpoint: '/api/analytics',
        debug: process.env.NODE_ENV === 'development',
        sampleRate: 1 // 100% sampling
      })
    : null;

// Initialize analytics on client side
if (typeof window !== 'undefined' && analytics) {
  // Track initial page view after a small delay to ensure document.referrer is available
  setTimeout(() => {
    analytics.trackPageView();
  }, 100);
}

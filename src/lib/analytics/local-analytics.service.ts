// lib/analytics/local-analytics.service.ts
import type { AnalyticsEvent, AnalyticsService, EnrichedAnalyticsEvent } from './types';

export class LocalAnalyticsService implements AnalyticsService {
  private events: EnrichedAnalyticsEvent[] = [];

  async captureEvent(event: AnalyticsEvent): Promise<void> {
    const enrichedEvent: EnrichedAnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date()
    };

    this.events.push(enrichedEvent);
    console.log('[Local Analytics] Event captured:', {
      event: enrichedEvent.eventName,
      properties: enrichedEvent.properties,
      timestamp: enrichedEvent.timestamp.toISOString()
    });

    // Store in localStorage for persistence (optional)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('local_analytics_events');
        const events = stored ? JSON.parse(stored) : [];
        events.push(enrichedEvent);
        localStorage.setItem('local_analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100
      } catch (error) {
        console.error('[Local Analytics] Failed to store in localStorage:', error);
      }
    }
  }

  async captureException(error: Error, properties?: Record<string, unknown>): Promise<void> {
    await this.captureEvent({
      eventName: 'exception',
      properties: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...properties
      }
    });
    console.error('[Local Analytics] Exception:', error);
  }

  async identifyUser(userId: string, traits?: Record<string, unknown>): Promise<void> {
    await this.captureEvent({
      eventName: 'identify',
      properties: {
        userId,
        traits
      }
    });
    console.log('[Local Analytics] User identified:', userId, traits);
  }

  getEvents(): EnrichedAnalyticsEvent[] {
    return this.events;
  }

  clearEvents(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('local_analytics_events');
    }
  }
}

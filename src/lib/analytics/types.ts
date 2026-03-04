// lib/analytics/types.ts
export interface AnalyticsEvent {
  eventName: string; // Changed from 'name' to match LocalAnalyticsService
  properties?: Record<string, unknown>;
  timestamp?: Date; // Optional to allow auto-generation
}

export interface EnrichedAnalyticsEvent extends AnalyticsEvent {
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  path?: string;
}

export interface AnalyticsService {
  captureEvent(event: AnalyticsEvent): Promise<void>;
  captureException(error: Error, properties?: Record<string, unknown>): Promise<void>;
  identifyUser(userId: string, traits?: Record<string, unknown>): Promise<void>;
}

export interface AnalyticsConfig {
  endpoint?: string;
  sampleRate?: number;
  debug?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

export interface PageView {
  path: string;
  referrer: string;
  sessionId: string;
  timestamp: Date;
  userAgent?: string;
  userId?: string;
}

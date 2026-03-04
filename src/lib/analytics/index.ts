// lib/analytics/index.ts

import { useCallback } from 'react'; // Use useCallback for stable function references

import { LocalAnalyticsService } from './local-analytics.service';
import { AnalyticsService, analytics } from './service';
export { AnalyticsService, LocalAnalyticsService, analytics };

export * from './types';

export function useAnalytics() {
  // Use useCallback so these functions don't change on every render
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    analytics?.trackEvent(eventName, properties);
  }, []);

  const trackPageView = useCallback((path?: string, referrer?: string) => {
    analytics?.trackPageView(path, referrer);
  }, []);

  const setUserId = useCallback((userId: string) => {
    analytics?.setUserId(userId);
  }, []);

  return {
    trackEvent,
    trackPageView,
    setUserId,
    analytics // Direct access
  };
}

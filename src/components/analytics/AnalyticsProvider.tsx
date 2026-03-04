// app/components/AnalyticsProvider.tsx
'use client';

import { createContext, type ReactNode, useContext, useEffect } from 'react';

import { useAnalytics } from '@/lib/analytics';

const AnalyticsContext = createContext<ReturnType<typeof useAnalytics> | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const analytics = useAnalytics();

  useEffect(() => {
    if (userId) {
      analytics.setUserId(userId);
    }
  }, [userId, analytics]);

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
}

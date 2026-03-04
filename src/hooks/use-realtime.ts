'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Import the Channel type from the pubsub module
import { pubsub as pubSub } from '@/server/redis';
import type { Channel } from '@/server/redis/pubsub';

// Define MessageHandler type based on the pubsub module
type MessageHandler<T = unknown> = (message: T) => void | Promise<void>;

// Types for realtime events
export interface RealtimeEvent<T = unknown> {
  channel: string;
  event: string;
  messageId: string;
  payload: T;
  timestamp: number;
}

export interface RealtimeState {
  error: Error | null;
  isConnected: boolean;
}

// Map our string channels to the allowed Channel types
const channelMap: Record<string, Channel | undefined> = {
  appointments: 'appointments',
  patients: 'patients',
  notifications: 'notifications',
  'queue-updates': 'queue-updates',
  'realtime-stats': 'realtime-stats',
  // Add prefixed versions that might be used
  'realtime:appointments': 'appointments',
  'realtime:patients': 'patients',
  'realtime:notifications': 'notifications',
  'realtime:queue-updates': 'queue-updates',
  'realtime:realtime-stats': 'realtime-stats'
};

function mapToChannel(channel: string): Channel {
  const mapped = channelMap[channel];
  if (!mapped) {
    // Default to 'notifications' as fallback or throw error
    console.warn(`Unknown channel: ${channel}, defaulting to 'notifications'`);
    return 'notifications';
  }
  return mapped;
}

// Client-side event bus for handling realtime messages
class RealtimeClient {
  private static instance: RealtimeClient;
  private readonly listeners: Map<string, Set<(payload: unknown) => void>>;
  private readonly connectionStates: Map<string, boolean>;
  private readonly reconnectTimeouts: Map<string, NodeJS.Timeout>;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private readonly activeSubscriptions: Map<string, { channel: Channel; event: string }>;

  private constructor() {
    this.listeners = new Map();
    this.connectionStates = new Map();
    this.reconnectTimeouts = new Map();
    this.activeSubscriptions = new Map();
  }

  static getInstance(): RealtimeClient {
    if (!RealtimeClient.instance) {
      RealtimeClient.instance = new RealtimeClient();
    }
    return RealtimeClient.instance;
  }

  /**
   * Subscribe to a channel and event
   */
  subscribe<T>(channel: string, event: string, callback: (payload: T) => void): () => void {
    const key = this.getKey(channel, event);

    // Initialize listeners set if needed
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    // Add callback to listeners
    this.listeners.get(key)?.add(callback as (payload: unknown) => void);

    // Set up Redis subscription if this is the first listener for this channel
    if (this.listeners.get(key)?.size === 1) {
      this.setupRedisSubscription(channel, event, key);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback as (payload: unknown) => void);

        // If no more listeners, remove Redis subscription
        if (listeners.size === 0) {
          this.listeners.delete(key);
          this.removeRedisSubscription(channel, key);
        }
      }
    };
  }

  /**
   * Publish an event to a channel
   */
  async publish<T>(channel: string, event: string, payload: T): Promise<void> {
    const message: RealtimeEvent<T> = {
      channel,
      event,
      payload,
      timestamp: Date.now(),
      messageId: crypto.randomUUID()
    };

    try {
      // Map the channel string to a valid Channel type
      const redisChannel = mapToChannel(channel);

      // Publish to Redis
      await pubSub.publish(redisChannel, event, message);

      // Also trigger local listeners immediately for better UX
      this.triggerLocalListeners(channel, event, payload);
    } catch (error) {
      console.error('Failed to publish to Redis:', error);
      // Fallback to local-only mode
      this.triggerLocalListeners(channel, event, payload);
      this.setConnectionState(channel, false, error as Error);
    }
  }

  /**
   * Get connection state for a channel
   */
  getConnectionState(channel: string): RealtimeState {
    return {
      isConnected: this.connectionStates.get(channel) ?? false,
      error: null // Error state is managed separately
    };
  }

  private getKey(channel: string, event: string): string {
    return `${channel}:${event}`;
  }

  private setupRedisSubscription(channel: string, event: string, key: string): void {
    // Map the channel string to a valid Channel type
    const redisChannel = mapToChannel(channel);

    // Create message handler
    const handler: MessageHandler = message => {
      try {
        // The message might be a string or already parsed object
        let parsed: RealtimeEvent<unknown>;

        if (typeof message === 'string') {
          parsed = JSON.parse(message) as RealtimeEvent<unknown>;
        } else {
          // If it's already an object, assume it's the message format
          parsed = message as unknown as RealtimeEvent<unknown>;
        }

        // Only process messages for the specific event
        if (parsed.event === event) {
          this.triggerLocalListeners(parsed.channel, parsed.event, parsed.payload);
        }
      } catch (error) {
        console.error('Failed to parse Redis message:', error);
      }
    };

    // Store subscription info
    this.activeSubscriptions.set(key, { channel: redisChannel, event });

    // Subscribe to Redis channel
    pubSub.subscribe(redisChannel, handler);

    // Set connection state
    this.setConnectionState(channel, true, null);

    // Clear any existing reconnect timeout
    const timeout = this.reconnectTimeouts.get(channel);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(channel);
    }
  }

  private removeRedisSubscription(channel: string, key: string): void {
    // Check if there are any other listeners for this channel with different events
    const hasOtherListeners = Array.from(this.listeners.keys()).some(
      listenerKey => listenerKey.startsWith(`${channel}:`) && listenerKey !== key
    );

    // Remove from active subscriptions
    this.activeSubscriptions.delete(key);

    // Only unsubscribe if no other listeners for this channel
    if (!hasOtherListeners) {
      // Since unsubscribe doesn't exist, we'll just track that we have no active subscriptions
      console.log(`No active listeners for channel: ${channel}`);
      this.connectionStates.delete(channel);
    }
  }

  private triggerLocalListeners<T>(channel: string, event: string, payload: T): void {
    const key = this.getKey(channel, event);
    const listeners = this.listeners.get(key);

    if (listeners) {
      // Use for...of instead of forEach to satisfy Biome linting
      for (const callback of listeners) {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in realtime callback:', error);
        }
      }
    }
  }

  private setConnectionState(channel: string, isConnected: boolean, error: Error | null): void {
    this.connectionStates.set(channel, isConnected);

    // Attempt reconnection if disconnected
    if (!isConnected && error) {
      this.attemptReconnection(channel);
    }
  }

  private attemptReconnection(channel: string, attempt = 1): void {
    if (attempt > this.maxReconnectAttempts) {
      console.error(`Failed to reconnect to channel ${channel} after ${this.maxReconnectAttempts} attempts`);
      return;
    }

    const timeout = setTimeout(
      async () => {
        try {
          // Map the channel string to a valid Channel type
          const redisChannel = mapToChannel(channel);

          // Test connection by publishing a ping
          await pubSub.publish(redisChannel, 'ping', { type: 'ping' });

          // If successful, reset connection state
          this.connectionStates.set(channel, true);
          this.reconnectTimeouts.delete(channel);
        } catch (error) {
          console.error(error);
          // If failed, try again
          this.attemptReconnection(channel, attempt + 1);
        }
      },
      this.reconnectDelay * 2 ** (attempt - 1)
    );

    this.reconnectTimeouts.set(channel, timeout);
  }
}

/**
 * Hook for Redis realtime subscriptions
 *
 * @example
 * ```tsx
 * // Listen for new notifications
 * const { isConnected } = useRealtime<Notification>(
 *   'notifications',
 *   'new-notification',
 *   (notification) => {
 *     toast.success(notification.title)
 *   }
 * )
 *
 * // Publish a notification
 * const handleSendNotification = () => {
 *   publish({
 *     id: '123',
 *     title: 'New Message',
 *     message: 'You have a new message',
 *     type: 'info',
 *     read: false,
 *     createdAt: new Date().toISOString()
 *   })
 * }
 * ```
 */
export function useRealtime<T = unknown>(
  channel: string,
  event: string,
  callback: (payload: T) => void
): {
  isConnected: boolean;
  error: Error | null;
  publish: (payload: T) => Promise<void>;
} {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    error: null
  });

  const client = useRef(RealtimeClient.getInstance());
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    // Subscribe to realtime events
    const unsubscribe = client.current.subscribe<T>(channel, event, stableCallback);

    // Update connection state periodically
    const interval = setInterval(() => {
      const connectionState = client.current.getConnectionState(channel);
      setState(connectionState);
    }, 1000);

    // Initial state
    setState(client.current.getConnectionState(channel));

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [channel, event, stableCallback]);

  // Publish function
  const publish = useCallback(
    async (payload: T) => {
      await client.current.publish(channel, event, payload);
    },
    [channel, event]
  );

  return {
    isConnected: state.isConnected,
    error: state.error,
    publish
  };
}

// Type-safe event definitions for common use cases
export interface NotificationEvent {
  createdAt: string;
  id: string;
  message: string;
  read: boolean;
  title: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string;
}

export interface PresenceEvent {
  lastSeen: string;
  sessionId?: string;
  status: 'online' | 'away' | 'offline';
  userId: string;
  workspaceId?: string;
}

export interface ChatEvent {
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  content: string;
  messageId: string;
  roomId: string;
  timestamp: string;
  userId: string;
  username: string;
}

export interface DocumentEvent {
  action: 'edit' | 'view' | 'leave' | 'save';
  changes?: unknown;
  documentId: string;
  timestamp: string;
  userId: string;
  version?: number;
}

export interface SystemEvent {
  expiresAt?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  type: 'maintenance' | 'update' | 'alert' | 'info';
}

// Usage examples with proper typing
export const useTypedRealtime = {
  useNotifications: (callback: (payload: NotificationEvent) => void) => {
    return useRealtime<NotificationEvent>('notifications', 'new-notification', callback);
  },

  usePresence: (workspaceId: string, callback: (payload: PresenceEvent) => void) => {
    return useRealtime<PresenceEvent>(`workspace:${workspaceId}`, 'presence', callback);
  },

  useChat: (roomId: string, callback: (payload: ChatEvent) => void) => {
    return useRealtime<ChatEvent>(`chat:${roomId}`, 'message', callback);
  },

  useDocument: (documentId: string, callback: (payload: DocumentEvent) => void) => {
    return useRealtime<DocumentEvent>(`document:${documentId}`, 'edit', callback);
  },

  useSystem: (callback: (payload: SystemEvent) => void) => {
    return useRealtime<SystemEvent>('system', 'broadcast', callback);
  }
};

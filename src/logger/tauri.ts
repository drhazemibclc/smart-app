import { invoke } from '@tauri-apps/api/core';
import { debug, error, info, warn } from '@tauri-apps/plugin-log';
import { type DestinationStream, pino } from 'pino';

import type { LogLevel } from './types';

interface TauriLogPayload {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class TauriDestination implements DestinationStream {
  private readonly isDevelopment: boolean;
  private logQueue: TauriLogPayload[] = [];
  private isFlushing = false;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async write(obj: unknown): Promise<void> {
    try {
      // Parse the pino log object
      const logObj = typeof obj === 'string' ? JSON.parse(obj) : obj;

      const logEntry: TauriLogPayload = {
        level: logObj.level as LogLevel,
        message: logObj.msg,
        metadata: logObj,
        timestamp: logObj.time || new Date().toISOString()
      };

      // Add to queue
      this.logQueue.push(logEntry);

      // Trigger flush
      if (!this.isFlushing) {
        this.isFlushing = true;
        await this.flush();
        this.isFlushing = false;
      }

      // Always write to console for development
      if (this.isDevelopment) {
        console.log(obj);
      }
    } catch (error) {
      console.error('Failed to write log via Tauri:', error);
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const queue = [...this.logQueue];
    this.logQueue = [];

    try {
      await invoke('write_logs', { entries: queue });
    } catch (error) {
      // If Tauri invoke fails, log to console and re-queue
      console.error('Failed to write logs to Tauri:', error);
      this.logQueue = [...queue, ...this.logQueue];
    }
  }
}

export function createTauriDestination(): DestinationStream {
  return new TauriDestination();
}

// Helper to detect Tauri environment
export const isTauriEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window || '__TAURI_INVOKE__' in window;
};

// This custom transport sends Pino logs to the Tauri Rust plugin
const tauriTransport = {
  write: (msg: string) => {
    const logObject = JSON.parse(msg);
    const level = logObject.level;
    const message = logObject.msg;

    // Map Pino levels to Tauri Log levels
    if (level >= 50) error(message);
    else if (level >= 40) warn(message);
    else if (level >= 30) info(message);
    else debug(message);
  }
};

export const logger = pino(
  {
    level: 'info',
    // Redact sensitive patient data before it hits the logs
    redact: ['patientName', 'nationalId', 'phoneNumber']
  },
  process.env.TAURI_ENV === 'true' ? tauriTransport : undefined
);

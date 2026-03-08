/**
 * High-performance Structured Logger with sensitive data sanitization
 * Optimized for Tauri + Next.js desktop application
 */

// Environment detection - cached for performance
const ENV = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isTauri:
    typeof window !== 'undefined' &&
    ('__TAURI__' in window || '__TAURI_INVOKE__' in window || window.navigator.userAgent?.includes('Tauri')),
  isBrowser: typeof window !== 'undefined',
  isServer: typeof window === 'undefined'
} as const;

// Log level configuration with priority ordering
const LOG_LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
  security: 3 // Same priority as warn
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Get configured log level with fallback
const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ||
  (process.env.LOG_LEVEL as LogLevel) ||
  (ENV.isDev ? 'debug' : 'info');

const CURRENT_LOG_PRIORITY = LOG_LEVELS[CURRENT_LOG_LEVEL];

// Optimized sensitive fields lookup - O(1) using Set
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwd',
  'pwd',
  'token',
  'jwt',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'apikey',
  'x-api-key',
  'authorization',
  'auth',
  'cookie',
  'session',
  'sessionId',
  'creditcard',
  'cc',
  'ccNumber',
  'cardNumber',
  'cvv',
  'ssn',
  'socialSecurity',
  'nationalId',
  'patientId',
  'email',
  'e-mail',
  'phone',
  'mobile',
  'telephone',
  'otp',
  '2fa',
  'mfa',
  'code',
  'verificationCode',
  'resetCode',
  'privateKey',
  'publicKey',
  'clientSecret',
  'clientId',
  'birthDate',
  'dob',
  'dateOfBirth',
  'address',
  'street',
  'city',
  'zip',
  'postalCode',
  'diagnosis',
  'medicalHistory',
  'bloodType',
  'allergies'
]);

// Field patterns for regex matching (used for partial matches)
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credit/i,
  /ssn/i,
  /email/i,
  /phone/i,
  /code/i,
  /patient/i,
  /medical/i,
  /health/i
];

// Pre-compiled regex for performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
} as const;

// Level-specific colors
const LEVEL_COLORS: Record<LogLevel, string> = {
  trace: COLORS.dim + COLORS.cyan,
  debug: COLORS.cyan,
  info: COLORS.green,
  warn: COLORS.yellow,
  error: COLORS.red,
  fatal: COLORS.bgRed + COLORS.white + COLORS.bright,
  security: COLORS.magenta + COLORS.bright
};

interface LogMeta {
  clinicId?: string;
  correlationId?: string;
  module?: string;
  requestId?: string;
  userId?: string;
  patientId?: string;
  appointmentId?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogMeta;
  data?: unknown;
  environment: string;
  version?: string;
}

// Optimized mask function with early returns
function maskSensitiveValue(value: string, field?: string): string {
  if (!value || value.length === 0) return '***';

  // Fast path for short values
  if (value.length <= 4) return '***';

  // Email masking (most common)
  if (field === 'email' && EMAIL_REGEX.test(value)) {
    const [local, domain] = value.split('@');
    if (!local || !domain) return '***';

    const maskedLocal = local.length > 2 ? local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 4)) : local;

    const domainParts = domain.split('.');
    const maskedDomain =
      domainParts[0] && domainParts[0].length > 2
        ? domainParts[0].slice(0, 2) + '*'.repeat(Math.min(domainParts[0].length - 2, 3))
        : domainParts[0] || '';

    return `${maskedLocal}@${maskedDomain}.${domainParts.slice(1).join('.')}`;
  }

  // Phone number masking
  if (field?.includes('phone') || PHONE_REGEX.test(value)) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return '***';
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }

  // Credit card masking (preserve last 4)
  if (field?.includes('credit') || field?.includes('card') || /^\d{13,16}$/.test(value.replace(/\D/g, ''))) {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 13) {
      return `****-****-****-${digits.slice(-4)}`;
    }
  }

  // Default masking pattern
  if (value.length <= 8) {
    return `${value[0]}***${value.slice(-1)}`;
  }

  return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 8)) + value.slice(-2);
}

// Optimized object sanitizer with circular reference detection
function sanitizeObject<T>(obj: T, depth = 0, visited = new WeakSet()): T {
  // Guard against maximum depth
  if (depth > 10) return '[Max depth exceeded]' as T;

  // Handle primitives
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle circular references
  if (visited.has(obj as object)) return '[Circular]' as T;
  visited.add(obj as object);

  // Handle special objects
  if (obj instanceof Date) return obj.toISOString() as T;
  if (obj instanceof RegExp) return obj.toString() as T;
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: ENV.isDev ? obj.stack : undefined,
      cause: obj.cause
    } as T;
  }
  if (obj instanceof Map) {
    return Array.from(obj.entries()).reduce(
      (acc, [k, v]) => {
        acc[k] = sanitizeObject(v, depth + 1, visited);
        return acc;
      },
      {} as Record<string, unknown>
    ) as T;
  }
  if (obj instanceof Set) {
    return Array.from(obj).map(v => sanitizeObject(v, depth + 1, visited)) as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, visited)) as T;
  }

  // Handle objects
  const sanitized: Record<string, unknown> = {};
  const keys = Object.keys(obj as object);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = (obj as Record<string, unknown>)[key];

    // Fast sensitive field check
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.has(lowerKey) || SENSITIVE_PATTERNS.some(pattern => pattern.test(lowerKey));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = ENV.isProd ? '[REDACTED]' : maskSensitiveValue(value, lowerKey);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1, visited);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

// Queue for batched Tauri writes
class TauriLogQueue {
  private queue: LogEntry[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 1000; // 1 second

  push(entry: LogEntry) {
    this.queue.push(entry);

    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    if (ENV.isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('write_logs', { entries: batch });
      } catch (error) {
        // Fallback to console
        console.error('Failed to write to Tauri log:', error);
        batch.forEach(entry => {
          this.writeToConsole(entry);
        });
      }
    }
  }

  private writeToConsole(entry: LogEntry) {
    const { level, timestamp, message, context, data } = entry;

    if (ENV.isDev) {
      const contextStr = Object.keys(context).length ? ` ${JSON.stringify(context)}` : '';
      const dataStr = data ? `\n  ${JSON.stringify(data, null, 2)}` : '';

      console.log(
        `${COLORS.dim}${timestamp}${COLORS.reset} ` +
          `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset} ` +
          `${message}${COLORS.dim}${contextStr}${COLORS.reset}${dataStr}`
      );
    } else {
      console.log(JSON.stringify(entry));
    }
  }
}

// Singleton instances
let tauriQueue: TauriLogQueue | null = null;

export class Logger {
  private readonly context: LogMeta;

  constructor(context: LogMeta = {}) {
    this.context = context;

    // Initialize Tauri queue if needed
    if (ENV.isTauri && !tauriQueue) {
      tauriQueue = new TauriLogQueue();
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogMeta): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Create a child logger for a specific module
   */
  module(name: string): Logger {
    return this.child({ module: name });
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= CURRENT_LOG_PRIORITY;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data: data ? sanitizeObject(data) : undefined,
      environment: process.env.NODE_ENV || 'development'
    };

    if (ENV.isTauri && tauriQueue) {
      tauriQueue.push(entry);
    } else {
      this.writeToConsole(entry);
    }
  }

  /**
   * Write entry to console
   */
  private writeToConsole(entry: LogEntry): void {
    const { level, timestamp, message, context, data } = entry;

    if (ENV.isDev) {
      const contextStr = Object.keys(context).length ? ` ${JSON.stringify(context)}` : '';
      const dataStr = data ? `\n  ${JSON.stringify(data, null, 2)}` : '';

      console.log(
        `${COLORS.dim}${timestamp}${COLORS.reset} ` +
          `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset} ` +
          `${message}${COLORS.dim}${contextStr}${COLORS.reset}${dataStr}`
      );
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  // Level-specific methods
  trace(message: string, data?: unknown): void {
    this.log('trace', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown, p0?: Error | undefined): void {
    let formattedData = error;

    if (error instanceof Error) {
      formattedData = {
        name: error.name,
        message: error.message,
        stack: ENV.isDev ? error.stack : undefined,
        cause: error.cause,
        code: (error as { code?: string | number }).code
      };
    }

    this.log('error', message, formattedData);
  }

  fatal(message: string, error?: unknown): void {
    let formattedData = error;

    if (error instanceof Error) {
      formattedData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
    }

    this.log('fatal', message, formattedData);
  }

  security(event: string, details?: unknown): void {
    this.log('security', `SECURITY: ${event}`, details);

    // Send to security webhook in production
    if (ENV.isProd && process.env.SECURITY_LOG_WEBHOOK) {
      this.sendToWebhook(event, details);
    }
  }

  /**
   * Send security events to webhook (non-blocking)
   */
  private sendToWebhook(event: string, details?: unknown): void {
    if (!ENV.isServer) return; // Only send from server

    const webhookUrl = process.env.SECURITY_LOG_WEBHOOK;
    if (!webhookUrl) return;

    // Use fetch with keepalive for reliable delivery
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.SECURITY_WEBHOOK_KEY || ''
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        details: sanitizeObject(details),
        context: this.context,
        environment: process.env.NODE_ENV
      }),
      keepalive: true
    }).catch(err => {
      // Silent fail - don't block main flow
      console.error('Webhook delivery failed:', err.message);
    });
  }

  /**
   * Performance tracking
   */
  perf(operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    this.info(`PERF: ${operation}`, {
      durationMs,
      ...metadata,
      type: 'performance'
    });
  }

  /**
   * Database query logging
   */
  query(model: string, operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    if (ENV.isDev || process.env.ENABLE_PRODUCTION_LOGS === 'true') {
      this.debug(`DB: ${model}.${operation}`, {
        durationMs,
        ...metadata,
        type: 'database'
      });
    }
  }

  /**
   * HTTP request logging
   */
  http(method: string, path: string, statusCode: number, durationMs: number, metadata?: Record<string, unknown>): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `HTTP ${method} ${path}`, {
      statusCode,
      durationMs,
      ...metadata,
      type: 'http'
    });
  }

  /**
   * Patient-specific logging
   */
  patient(patientId: string, action: string, metadata?: Record<string, unknown>): void {
    this.info(`Patient: ${action}`, {
      patientId,
      ...metadata,
      type: 'patient'
    });
  }

  /**
   * Appointment logging
   */
  appointment(appointmentId: string, action: string, metadata?: Record<string, unknown>): void {
    this.info(`Appointment: ${action}`, {
      appointmentId,
      ...metadata,
      type: 'appointment'
    });
  }

  /**
   * Time a function execution
   */
  async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.perf(operation, duration);
    }
  }

  /**
   * Create a timer that logs when stopped
   */
  timer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.perf(operation, duration);
    };
  }
}

// Create default logger instance
export const logger = new Logger();

// Factory function for creating module loggers
export function createLogger(module: string): Logger {
  return logger.child({ module });
}

// Pre-created module loggers (lazy initialization)
let _dbLogger: Logger | null = null;
let _trpcLogger: Logger | null = null;
let _authLogger: Logger | null = null;
let _patientLogger: Logger | null = null;

export const dbLogger = (() => {
  if (!_dbLogger) {
    _dbLogger = createLogger('database');
  }
  return _dbLogger;
})();

export const trpcLogger = (() => {
  if (!_trpcLogger) {
    _trpcLogger = createLogger('trpc');
  }
  return _trpcLogger;
})();

export const authLogger = (() => {
  if (!_authLogger) {
    _authLogger = createLogger('auth');
  }
  return _authLogger;
})();

export const patientLogger = (() => {
  if (!_patientLogger) {
    _patientLogger = createLogger('patient');
  }
  return _patientLogger;
})();

// Export utilities
export { ENV, LOG_LEVELS, maskSensitiveValue, sanitizeObject };

// Export types
export type { LogEntry, LogLevel, LogMeta };

// Default export
export default logger;

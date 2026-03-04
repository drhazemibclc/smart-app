/**
 * Structured Logger with sensitive data sanitization
 */

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apikey',
  'authorization',
  'cookie',
  'session',
  'creditcard',
  'ssn',
  'email',
  'phone',
  'otp',
  'code',
  'verificationcode',
  'resettoken',
  'refreshtoken',
  'accesstoken',
  'privatekey',
  'clientsecret'
];

function maskSensitiveValue(value: string, field?: string): string {
  if (!value) return '***';

  // Handle email specially
  if (field === 'email' && value.includes('@')) {
    const [local, domain] = value.split('@');
    if (!(local && domain)) return '***';
    const maskedLocal =
      (local?.length ?? 0) > 2 ? `${local?.slice(0, 2)}${'*'.repeat(Math.min((local?.length ?? 0) - 2, 4))}` : local;
    const domainParts = domain.split('.');
    const maskedDomain =
      (domainParts[0]?.length ?? 0) > 2
        ? `${domainParts[0]?.slice(0, 2)}${'*'.repeat(Math.min((domainParts[0]?.length ?? 0) - 2, 3))}`
        : (domainParts[0] ?? '');
    return `${maskedLocal}@${maskedDomain}.${domainParts.slice(1).join('.')}`;
  }

  // Handle phone numbers
  if (field?.includes('phone')) {
    if (value.length <= 4) return '***';
    return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
  }

  // Handle other sensitive values
  if (value.length <= 4) return '***';
  if (value.length <= 8) return `${value[0]}***${value.slice(-1)}`;
  return `${value.slice(0, 2)}${'*'.repeat(Math.min(value.length - 4, 8))}${value.slice(-2)}`;
}

function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 8) return '[Max depth exceeded]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return obj.toString();
  }

  // Handle Error objects
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: process.env.NODE_ENV === 'development' ? obj.stack : undefined
    };
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = process.env.NODE_ENV === 'production' ? '[REDACTED]' : maskSensitiveValue(value, lowerKey);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

interface LogMeta {
  clinicId?: string;
  correlationId?: string;
  module?: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  context: LogMeta;
  data?: unknown;
  environment: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

class Logger {
  private readonly context: LogMeta;
  private readonly isDev = process.env.NODE_ENV === 'development';
  private readonly isProd = process.env.NODE_ENV === 'production';
  private readonly enableProductionLogs = process.env.ENABLE_PRODUCTION_LOGS === 'true';

  constructor(context: LogMeta = {}) {
    this.context = context;
  }

  child(context: LogMeta): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private formatLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data: data ? sanitizeObject(data) : undefined,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === 'debug' && !this.isDev) return false;
    if (level === 'info' && this.isProd && !this.enableProductionLogs) return false;
    return true;
  }

  private writeToConsole(entry: LogEntry): void {
    const { level, timestamp, message, context, data } = entry;

    // Format for better readability in development
    if (this.isDev) {
      const contextStr = Object.keys(context).length ? ` ${JSON.stringify(context)}` : '';
      const dataStr = data ? `\n  ${JSON.stringify(data, null, 2)}` : '';

      const coloredMessage = this.getColoredMessage(level, message);
      console.log(`${timestamp} ${coloredMessage}${contextStr}${dataStr}`);
    } else {
      // In production, always log as JSON for proper parsing by log aggregation tools
      console.log(JSON.stringify(entry));
    }
  }

  private getColoredMessage(level: LogLevel, message: string): string {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m', // green
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      security: '\x1b[35m' // magenta
    };
    const reset = '\x1b[0m';
    return `${colors[level]}[${level.toUpperCase()}]${reset} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatLogEntry(level, message, data);
    this.writeToConsole(entry);
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

  error(message: string, error?: unknown): void {
    let formattedData = error;

    if (error instanceof Error) {
      formattedData = {
        name: error.name,
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
        cause: error.cause
      };
    }

    this.log('error', message, formattedData);
  }

  security(event: string, details?: unknown): void {
    this.log('security', event, details);

    // Send security events to external webhook in production
    if (this.isProd && process.env.SECURITY_LOG_WEBHOOK) {
      // Don't await this to avoid blocking
      fetch(process.env.SECURITY_LOG_WEBHOOK, {
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
        })
      }).catch(err => {
        // Use console.error directly to avoid infinite loops
        console.error('Failed to send security log to webhook:', err);
      });
    }
  }

  /**
   * Create a performance tracking log
   */
  perf(operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    this.info(`PERF: ${operation}`, {
      durationMs,
      ...metadata
    });
  }

  /**
   * Log database queries (sanitized)
   */
  query(model: string, operation: string, durationMs: number, metadata?: Record<string, unknown>): void {
    if (this.isDev || this.enableProductionLogs) {
      this.debug(`DB: ${model}.${operation}`, {
        durationMs,
        ...metadata
      });
    }
  }

  /**
   * Log API requests/responses
   */
  http(method: string, path: string, statusCode: number, durationMs: number, metadata?: Record<string, unknown>): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `HTTP ${method} ${path}`, {
      statusCode,
      durationMs,
      ...metadata
    });
  }
}

// Create default logger instance
export const logger = new Logger();

// Export factory function for creating child loggers
export function createLogger(context: LogMeta = {}): Logger {
  return new Logger(context);
}

// Export utility functions
export { maskSensitiveValue, sanitizeObject };

// Export types
export type { Logger, LogLevel, LogMeta };

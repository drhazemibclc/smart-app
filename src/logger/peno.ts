import pino from 'pino';

import type { ILogger, LogContext, LogLevel, LogMetadata } from './types';

const isDevelopment = process.env.NODE_ENV === 'development';

// Custom level mapping to match ILogger requirements
const customLevels = {
  fatal: 60,
  error: 50,
  security: 45,
  warn: 40,
  audit: 35,
  info: 30,
  debug: 20,
  trace: 10
};

// Create Pino logger instance
const pinoLogger = pino<LogLevel>({
  level: 'info',
  redact: ['patientName', 'liscenceNumber', 'phoneNumber'],
  customLevels,
  formatters: {
    level: label => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});

/**
 * Pino-based logger implementation
 */
class PinoLogger implements ILogger {
  private logContext: LogContext = {};

  constructor(
    private pinoInstance: pino.Logger<LogLevel>,
    context?: LogContext
  ) {
    if (context) {
      this.logContext = context;
    }
  }

  get context(): LogContext {
    return this.logContext;
  }

  getContext(): LogContext {
    return this.logContext;
  }

  setContext(context: LogContext): void {
    this.logContext = { ...this.logContext, ...context };
  }

  fatal(message: string, metadata?: LogMetadata, error?: Error): void {
    this.pinoInstance.fatal({ ...this.logContext, ...metadata, err: error }, message);
  }

  error(message: string, metadata?: LogMetadata, error?: Error): void {
    this.pinoInstance.error({ ...this.logContext, ...metadata, err: error }, message);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.pinoInstance.warn({ ...this.logContext, ...metadata }, message);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.pinoInstance.info({ ...this.logContext, ...metadata }, message);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.pinoInstance.debug({ ...this.logContext, ...metadata }, message);
  }

  trace(message: string, metadata?: LogMetadata): void {
    this.pinoInstance.trace({ ...this.logContext, ...metadata }, message);
  }

  audit(detailsOrAction: unknown, resource?: string, resourceId?: string, details?: unknown): void {
    if (typeof detailsOrAction === 'object') {
      this.pinoInstance.info({ ...this.logContext, audit: detailsOrAction, type: 'AUDIT' }, 'Audit event');
    } else {
      this.pinoInstance.info(
        {
          ...this.logContext,
          audit: { action: detailsOrAction, resource, resourceId, details },
          type: 'AUDIT'
        },
        'Audit event'
      );
    }
  }

  security(event: string, metadata?: LogMetadata): void {
    this.pinoInstance.warn({ ...this.logContext, ...metadata, type: 'SECURITY' }, event);
  }

  clinical(level: LogLevel, message: string, patientId: string, metadata?: LogMetadata): void {
    const logFn = this.pinoInstance[level as keyof pino.Logger] as (obj: unknown, msg: string) => void;
    if (typeof logFn === 'function') {
      logFn.call(this.pinoInstance, { ...this.logContext, ...metadata, patientId, type: 'CLINICAL' }, message);
    }
  }

  patientFlow(patientId: string, action: string, metadata?: LogMetadata): void {
    this.pinoInstance.info(
      { ...this.logContext, ...metadata, patientId, action, type: 'PATIENT_FLOW' },
      'Patient flow event'
    );
  }

  performance(operation: string, duration: number, metadata?: LogMetadata): void {
    this.pinoInstance.info(
      { ...this.logContext, ...metadata, operation, duration, type: 'PERFORMANCE' },
      'Performance metric'
    );
  }

  appointment(action: string, appointmentId: string, metadata?: LogMetadata): void {
    this.pinoInstance.info(
      { ...this.logContext, ...metadata, action, appointmentId, type: 'APPOINTMENT' },
      'Appointment event'
    );
  }

  child(metadata: LogMetadata): ILogger {
    return new PinoLogger(this.pinoInstance.child(metadata), { ...this.logContext, ...metadata });
  }

  withRequest(req: unknown, _res: unknown): ILogger {
    const requestContext: LogContext = {
      requestId: (req as { id?: string }).id,
      method: (req as { method?: string }).method,
      path: (req as { url?: string }).url
    };
    return new PinoLogger(this.pinoInstance.child(requestContext), { ...this.logContext, ...requestContext });
  }

  addTransport(): void {
    // Pino transports are configured at initialization
    throw new Error('Pino transports must be configured at logger creation');
  }

  async flush(): Promise<void> {
    return new Promise(resolve => {
      this.pinoInstance.flush(() => resolve());
    });
  }

  async close(): Promise<void> {
    await this.flush();
  }

  get pino(): pino.Logger<LogLevel> {
    return this.pinoInstance;
  }
}

// Export singleton instance
export const logger = new PinoLogger(pinoLogger);

// Export factory function
export function createPinoLogger(context?: LogContext): ILogger {
  return new PinoLogger(pinoLogger, context);
}

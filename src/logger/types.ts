import type { IncomingMessage, ServerResponse } from 'node:http';

import type { LoggerOptions, Level as PinoLevel, Logger as PinoLogger } from 'pino';

/**
 * Valid Pino Log Levels
 * Added 'audit' and 'security' as custom levels.
 */
export type LogLevel = PinoLevel | 'audit' | 'security';

/**
 * Pediatric-specific Log Types for filtering in Elastic/Sentry
 */
export type LogType =
  | 'PATIENT_REGISTRATION'
  | 'APPOINTMENT'
  | 'ENCOUNTER'
  | 'VITALS'
  | 'GROWTH_CHART'
  | 'IMMUNIZATION'
  | 'PRESCRIPTION'
  | 'LAB_RESULT'
  | 'FEEDING_LOG'
  | 'DEVELOPMENTAL_CHECK'
  | 'BILLING'
  | 'USER_ACTION'
  | 'SECURITY'
  | 'SYSTEM'
  | 'AI_NUTRITION'
  | 'QUEUE_UPDATE'
  | 'AUDIT'
  | 'PERFORMANCE'
  | 'PATIENT_FLOW';

/**
 * Metadata shared across all logs.
 * We extend Record<string, unknown> to satisfy Pino's object requirements.
 */
export interface LogMetadata extends Record<string, unknown> {
  appointmentId?: string;
  clinicId?: string;
  doctorId?: string;
  duration?: number;
  environment?: string;
  patientId?: string;
  requestId?: string;
  type?: LogType;
  userId?: string;
  version?: string;
}

export interface AuditDetails {
  action: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ip?: string;
  reason?: string;
  resource: string;
  resourceId: string;
  userAgent?: string;
  userId: string;
}

export interface LogContext {
  action?: string;
  clinicId?: string;
  doctorId?: string;
  ip?: string;
  method?: string;
  module?: string;
  path?: string;
  patientId?: string;
  requestId?: string;
  resource?: string;
  resourceId?: string;
  startTime?: Date;
  userAgent?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface ErrorDetails {
  cause?: Error;
  code?: string | number;
  isOperational?: boolean;
  message: string;
  name: string;
  stack?: string;
  statusCode?: number;
}

export interface LogEntry {
  audit?: {
    action: string;
    resource: string;
    resourceId: string;
    details: AuditDetails;
  };
  error?: ErrorDetails;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  timestamp: Date;
}

export interface Transport {
  close?(): Promise<void>;
  log(entry: LogEntry): Promise<void>;
  name: string;
}

export interface TransportConfig {
  enabled: boolean;
  level?: LogLevel | LogLevel[];
  options?: Record<string, unknown>;
  type: 'console' | 'file' | 'database' | 'sentry' | 'custom';
}

/**
 * Main Logger Interface
 */
export interface ILogger {
  // Core logging methods
  fatal(message: string, metadata?: LogMetadata, error?: Error): void;
  error(message: string, metadata?: LogMetadata, error?: Error): void;
  warn(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  debug(message: string, metadata?: LogMetadata): void;
  trace(message: string, metadata?: LogMetadata): void;

  // Audit methods (must be adjacent)
  audit(details: AuditDetails): void;
  audit(action: string, resource: string, resourceId: string, details: AuditDetails): void;

  // Security and domain-specific methods
  security(event: string, metadata?: LogMetadata): void;
  clinical(level: LogLevel, message: string, patientId: string, metadata?: LogMetadata): void;
  patientFlow(patientId: string, action: string, metadata?: LogMetadata): void;
  performance(operation: string, duration: number, metadata?: LogMetadata): void;
  appointment(action: string, appointmentId: string, metadata?: LogMetadata): void;

  // Context management
  child(metadata: LogMetadata): ILogger;
  withRequest(req: IncomingMessage, res: ServerResponse): ILogger;
  getContext(): LogContext;
  setContext(context: LogContext): void;

  // Transport management
  addTransport(transport: Transport): void;

  // Lifecycle
  flush(): Promise<void>;
  close(): Promise<void>;

  // Access to underlying Pino instance
  readonly pino: PinoLogger<LogLevel>;
  readonly context: LogContext;
}

/**
 * Config for the Logger Factory
 */
export interface PediatricLoggerConfig extends Omit<LoggerOptions, 'level'> {
  environment: 'development' | 'production' | 'test';
  level: LogLevel;
  redactFields?: string[];
  serviceName: string;
}

export interface TauriLogEntry {
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  timestamp: string;
}

export interface LoggerConfig {
  appName: string;
  async: boolean;
  bufferSize: number;
  environment?: string;
  flushInterval: number;
  level: LogLevel;
  prettyPrint: boolean;
  redactFields: string[];
  redactPaths: string[];
  sampleRate?: number; // For performance sampling
  sentryDsn?: string;
  service: string;
  timestampFormat: string;
  transports: TransportConfig[];
  version?: string;
  correlationId?: string;
  duration?: number;
  module?: string;
  patientId?: string;
  requestId?: string;
  type?: LogType;
  [key: string]: unknown;
}

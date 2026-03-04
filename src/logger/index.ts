import { logger } from './logger';

export { logger as default, logger } from './logger';

console.log('Hello via pnpm!');

// Re-export everything else
export * from './formatters';
export { ConsoleTransport } from './transports/console';
export { FileTransport } from './transports/file';
export * from './types';

// // Create child loggers for specific contexts
// export function createPatientLogger(patientId: string, clinicId?: string) {
//   return logger.child({
//     type: 'PATIENT_REGISTRATION',
//     patientId,
//     clinicId
//   });
// }

// export function createClinicLogger(clinicId: string) {
//   return logger.child({
//     type: 'SYSTEM',
//     clinicId
//   });
// }

// export function createUserLogger(userId: string, clinicId?: string) {
//   return logger.child({
//     type: 'USER_ACTION',
//     userId,
//     clinicId
//   });
// }

// Create loggers for different modules
export const dbLogger = logger.child({ module: 'database' });
export const trpcLogger = logger.child({ module: 'trpc' });
export const authLogger = logger.child({ module: 'auth' });
export const patientLogger = logger.child({ module: 'patient' });
export const appointmentLogger = logger.child({ module: 'appointment' });
export const aiLogger = logger.child({ module: 'ai' });
export const serverLogger = logger.child({ module: 'server' });
export const wsLogger = logger.child({ module: 'ws' });
export const schedulerLogger = logger.child({ module: 'scheduler' });
export const videoLogger = logger.child({ module: 'video' });
export const parserLogger = logger.child({ module: 'parser' });
export const redisLogger = logger.child({ module: 'redis' });

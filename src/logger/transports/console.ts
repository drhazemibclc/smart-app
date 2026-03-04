import chalk from 'chalk';
import { format } from 'date-fns'; // Using your existing date-fns package

import type { LogEntry, Transport } from '../types';

const levelColors: Record<string, (str: string) => string> = {
  fatal: s => chalk.red.bold(s),
  error: s => chalk.red(s),
  warn: s => chalk.yellow(s),
  info: s => chalk.blue(s),
  debug: s => chalk.cyan(s),
  trace: s => chalk.gray(s),
  audit: s => chalk.magenta.bold(s)
};

const typeColors: Record<string, (str: string) => string> = {
  PATIENT_REGISTRATION: s => chalk.bgBlue.white(s),
  APPOINTMENT: s => chalk.bgGreen.white(s),
  ENCOUNTER: s => chalk.bgMagenta.white(s),
  VITALS: s => chalk.bgCyan.white(s),
  GROWTH_CHART: s => chalk.bgYellow.black(s),
  IMMUNIZATION: s => chalk.bgYellow.white(s),
  PRESCRIPTION: s => chalk.bgRed.white(s),
  SECURITY: s => chalk.bgRed.white.bold(s),
  AI_NUTRITION: s => chalk.bgGreen.white(s),
  QUEUE_UPDATE: s => chalk.bgBlue.white(s),
  AUDIT: s => chalk.bgMagenta.white.bold(s),
  SYSTEM: s => chalk.bgGray.white(s)
};

export class ConsoleTransport implements Transport {
  name = 'console';

  async log(entry: LogEntry): Promise<void> {
    // 1. Replace dayjs with date-fns format
    // 'HH:mm:ss.SSS' becomes 'HH:mm:ss.SSS' in date-fns as well
    const timestamp = format(new Date(entry.timestamp), 'HH:mm:ss.SSS');

    const levelColor = levelColors[entry.level] || chalk.white;
    const typeColor = entry.metadata?.type ? typeColors[entry.metadata.type] || chalk.white : chalk.white;

    // Build the log line
    const parts: string[] = [chalk.gray(`[${timestamp}]`), levelColor(entry.level.toUpperCase().padEnd(7))];

    if (entry.metadata?.type) {
      parts.push(typeColor(` ${entry.metadata.type} `));
    }

    if (entry.metadata?.requestId) {
      parts.push(chalk.gray(`[${entry.metadata.requestId.slice(0, 8)}]`));
    }

    parts.push(entry.message);

    // Clean up metadata for display
    const metadata = { ...entry.metadata };
    delete metadata.type;
    delete metadata.requestId;

    if (Object.keys(metadata).length > 0) {
      parts.push(`\n${chalk.gray(JSON.stringify(metadata, null, 2))}`);
    }

    if (entry.error) {
      parts.push(`\n${chalk.red(entry.error.stack || entry.error.message)}`);
    }

    if (entry.metadata?.audit) {
      parts.push(`\n${chalk.magenta(JSON.stringify(entry.metadata.audit, null, 2))}`);
    }

    const output = parts.join(' ');

    switch (entry.level) {
      case 'fatal':
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'info':
        console.info(output);
        break;
      default:
        console.log(output);
    }
  }
}

export default ConsoleTransport;

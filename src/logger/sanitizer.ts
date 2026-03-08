export const SENSITIVE_FIELDS = [
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
] as const;

export function maskSensitiveValue(value: string, field?: string): string {
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

export function sanitizeObject(obj: unknown, depth = 0, isProduction = false): unknown {
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
      stack: !isProduction ? obj.stack : undefined
    };
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, isProduction));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

    if (isSensitive && typeof value === 'string') {
      sanitized[key] = isProduction ? '[REDACTED]' : maskSensitiveValue(value, lowerKey);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1, isProduction);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

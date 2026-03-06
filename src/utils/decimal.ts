/**
 * Client-safe decimal utilities
 * These functions work with Decimal.js types without importing server dependencies
 */

interface DecimalLike {
  toNumber: () => number;
}

function isDecimalLike(value: unknown): value is DecimalLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof (value as DecimalLike).toNumber === 'function'
  );
}

/**
 * Convert any valid decimal input to a JS number
 * Supports: number, string, Decimal-like objects
 */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number string: ${value}`);
    }
    return num;
  }
  if (isDecimalLike(value)) {
    return value.toNumber();
  }
  throw new Error('Invalid decimal input');
}

/**
 * Convert decimal to number with fallback
 */
export function decimalToNumber(value?: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (isDecimalLike(value)) {
    return value.toNumber();
  }
  return 0;
}

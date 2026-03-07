// src/utils/formatDate.test.ts
import { describe, expect, it } from 'vitest';

import { formatDate } from './formDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-03-05');
    expect(formatDate(date)).toContain('Mar 5, 2026');
  });

  it('handles invalid dates', () => {
    const result = formatDate('invalid-date-string');
    expect(result).toBe('Invalid date');
  });

  it('formats with custom options', () => {
    const date = new Date('2026-03-05');
    const result = formatDate(date, 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    expect(result).toBe('March 5, 2026');
  });
});

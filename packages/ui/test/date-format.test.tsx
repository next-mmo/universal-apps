import { describe, expect, it } from 'vitest';

import { formatDateShort, formatDayLabel, formatMonthYear, weekdayLabels } from '../src/lib/date-format.ts';

const SEPTEMBER_20 = new Date(2026, 8, 20);

describe('date-format', () => {
  it('formats a heading, a day label, and a short date in a pinned locale', () => {
    expect(formatMonthYear(SEPTEMBER_20, 'en-US')).toBe('September 2026');
    expect(formatDayLabel(SEPTEMBER_20, 'en-US')).toBe('September 20, 2026');
    expect(formatDateShort(SEPTEMBER_20, 'en-US')).toBe('Sep 20, 2026');
  });

  it('formats the same date differently under another locale', () => {
    const french = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(SEPTEMBER_20);
    expect(formatMonthYear(SEPTEMBER_20, 'fr-FR')).toBe(french);
    expect(formatMonthYear(SEPTEMBER_20, 'fr-FR')).not.toBe(formatMonthYear(SEPTEMBER_20, 'en-US'));
  });

  it('labels the week in grid order, Sunday first, in the pinned locale', () => {
    expect(weekdayLabels('en-US')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });
});

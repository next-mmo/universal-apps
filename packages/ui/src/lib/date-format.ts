/**
 * Locale-aware date strings for the date components, built on `Intl.DateTimeFormat` so the kit
 * stays dependency-free. Every label follows the runtime locale unless a caller pins one through
 * a `locale` prop; formatters are cached per locale because constructing them is the costly part.
 * The calendar grid is Sunday-first — day columns are `getDay()`-indexed — so only the weekday
 * names localize, not the week layout.
 */

const FORMAT_STYLES = {
  monthYear: { month: 'long', year: 'numeric' },
  dayLabel: { month: 'long', day: 'numeric', year: 'numeric' },
  dateShort: { month: 'short', day: 'numeric', year: 'numeric' },
  weekday: { weekday: 'short' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

type DateFormatStyle = keyof typeof FORMAT_STYLES;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(style: DateFormatStyle, locale: string | undefined): Intl.DateTimeFormat {
  const key = `${style}|${locale ?? ''}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, FORMAT_STYLES[style]);
    formatters.set(key, formatter);
  }
  return formatter;
}

/** The calendar heading, e.g. "September 2026". */
export function formatMonthYear(date: Date, locale?: string): string {
  return formatterFor('monthYear', locale).format(date);
}

/** The full-day screen-reader label, e.g. "September 20, 2026". */
export function formatDayLabel(date: Date, locale?: string): string {
  return formatterFor('dayLabel', locale).format(date);
}

/** The picker trigger text, e.g. "Sep 20, 2026". */
export function formatDateShort(date: Date, locale?: string): string {
  return formatterFor('dateShort', locale).format(date);
}

/** Seven weekday names in grid order; the anchor is a Sunday, matching the day columns. */
export function weekdayLabels(locale?: string): string[] {
  const formatter = formatterFor('weekday', locale);
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + index)));
}

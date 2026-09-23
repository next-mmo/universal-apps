import * as React from 'react';

/**
 * Anchor-then-end range selection, ported from react-day-picker's semantics (MIT) so a future
 * library swap is a wrapper change rather than an API break. The hook is DOM-free: the surfaces
 * feed it presses and (DOM only) hover positions, and it hands back the range to render.
 */

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type RangeSide = 'start' | 'end';
export type RangeDayState = 'start' | 'middle' | 'end';
export type RangeCommitBehavior = 'clear' | 'reset' | 'select';

export interface UseRangeSelectionOptions {
  /** The committed range, controlled by the caller. */
  selected?: DateRange;
  onSelect?: (range: DateRange) => void;
  /**
   * Fires while the range is still being picked: `'start'` when the anchor is placed, `'end'` on
   * every preview update after it. Live filters consume this; form-style callers can ignore it.
   */
  onSelectInProgress?: (range: DateRange, side: RangeSide) => void;
  /** The anchor is passed as the second argument, so rules like "no end before the anchor" work. */
  disabledDate?: (date: Date, anchor?: Date) => boolean;
  /** Minimum and maximum days the committed range may span, both inclusive. */
  min?: number;
  max?: number;
  /** When true, the committed range is trimmed at the first blocked day rather than including it. */
  excludeDisabled?: boolean;
  /**
   * What a mid-selection dismiss does — a picker closing after the anchor but before the end.
   * `'reset'` discards the pick, `'clear'` clears the value, `'select'` commits the anchor alone.
   * A plain open-and-close with no anchor is unaffected.
   */
  commitBehavior?: RangeCommitBehavior;
}

export interface RangeSelection {
  /** The placed start of an in-progress pick, if any. */
  anchor?: Date;
  inProgress: boolean;
  /** The committed selection as given by the caller. */
  selected: DateRange;
  /** The range to render: the committed selection, or the anchor-to-preview span. */
  preview: DateRange;
  /** True while the preview span differs from the anchor alone. */
  isPreviewing: boolean;
  press: (date: Date) => void;
  hover: (date: Date | null) => void;
  /** Applies `commitBehavior`; a no-op unless a pick is in progress. */
  dismiss: () => void;
  clear: () => void;
  dayState: (date: Date) => RangeDayState | null;
}

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function isSameDay(a?: Date, b?: Date): boolean {
  return Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  );
}

export function rangeDayCount(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS) + 1;
}

export function rangeDayState(range: DateRange, date: Date): RangeDayState | null {
  if (!range.from) return null;
  const to = range.to ?? range.from;
  const time = startOfDay(date).getTime();
  if (time < startOfDay(range.from).getTime() || time > startOfDay(to).getTime()) return null;
  // A one-day range is reported as its start; the calendar rounds it on both sides.
  if (isSameDay(date, range.from)) return 'start';
  if (isSameDay(date, to)) return 'end';
  return 'middle';
}

export function useRangeSelection({
  selected,
  onSelect,
  onSelectInProgress,
  disabledDate,
  min,
  max,
  excludeDisabled,
  commitBehavior = 'reset',
}: UseRangeSelectionOptions): RangeSelection {
  const [anchor, setAnchor] = React.useState<Date>();
  const [hoverDate, setHoverDate] = React.useState<Date>();

  const preview = React.useMemo<DateRange>(() => {
    if (!anchor) return selected ?? {};
    const hovered = hoverDate ?? anchor;
    const backwards = startOfDay(hovered).getTime() < startOfDay(anchor).getTime();
    return backwards ? { from: hovered, to: anchor } : { from: anchor, to: hovered };
  }, [anchor, hoverDate, selected]);

  const commitRange = React.useCallback(
    (start: Date, clicked: Date): DateRange => {
      const backwards = startOfDay(clicked).getTime() < startOfDay(start).getTime();
      let from = backwards ? clicked : start;
      let to = backwards ? start : clicked;

      // min/max clamp the moving end; the anchor the user chose stays fixed.
      if (max && rangeDayCount(from, to) > max) {
        if (backwards) from = addDays(start, -(max - 1));
        else to = addDays(start, max - 1);
      }
      if (min && rangeDayCount(from, to) < min) {
        if (backwards) from = addDays(start, -(min - 1));
        else to = addDays(start, min - 1);
      }

      if (excludeDisabled && disabledDate) {
        if (backwards) {
          for (let day = addDays(start, -1); startOfDay(day).getTime() > startOfDay(from).getTime(); day = addDays(day, -1)) {
            if (disabledDate(day, start)) {
              from = addDays(day, 1);
              break;
            }
          }
        } else {
          for (let day = addDays(start, 1); startOfDay(day).getTime() < startOfDay(to).getTime(); day = addDays(day, 1)) {
            if (disabledDate(day, start)) {
              to = addDays(day, -1);
              break;
            }
          }
        }
        // Trimming wins over min/max: a range may not include a blocked day.
        if (startOfDay(from).getTime() > startOfDay(to).getTime()) {
          from = start;
          to = start;
        }
      }

      return { from, to };
    },
    [disabledDate, excludeDisabled, max, min],
  );

  const press = React.useCallback(
    (date: Date) => {
      if (disabledDate?.(date, anchor)) return;
      if (!anchor) {
        setAnchor(date);
        setHoverDate(undefined);
        onSelectInProgress?.({ from: date }, 'start');
        return;
      }
      const range = commitRange(anchor, date);
      setAnchor(undefined);
      setHoverDate(undefined);
      onSelect?.(range);
    },
    [anchor, commitRange, disabledDate, onSelect, onSelectInProgress],
  );

  const hover = React.useCallback(
    (date: Date | null) => {
      setHoverDate(date ?? undefined);
      if (!anchor || !date) return;
      const backwards = startOfDay(date).getTime() < startOfDay(anchor).getTime();
      onSelectInProgress?.(backwards ? { from: date, to: anchor } : { from: anchor, to: date }, 'end');
    },
    [anchor, onSelectInProgress],
  );

  const dismiss = React.useCallback(() => {
    if (!anchor) return;
    setAnchor(undefined);
    setHoverDate(undefined);
    if (commitBehavior === 'clear') onSelect?.({});
    else if (commitBehavior === 'select') onSelect?.({ from: anchor, to: anchor });
  }, [anchor, commitBehavior, onSelect]);

  const clear = React.useCallback(() => {
    setAnchor(undefined);
    setHoverDate(undefined);
    onSelect?.({});
  }, [onSelect]);

  return {
    anchor,
    inProgress: Boolean(anchor),
    selected: selected ?? {},
    preview,
    isPreviewing: Boolean(anchor && hoverDate && !isSameDay(anchor, hoverDate)),
    press,
    hover,
    dismiss,
    clear,
    dayState: (date: Date) => rangeDayState(preview, date),
  };
}

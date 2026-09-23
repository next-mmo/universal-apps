import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { isSameDay, rangeDayState } from '../../lib/use-range-selection';
import type { DateRange } from '../../lib/use-range-selection';

export interface CalendarProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  /** `'range'` switches to the controlled range props below; the single-date API is unchanged. */
  mode?: 'single' | 'range';
  /** Range mode: the committed selection. */
  selected?: DateRange;
  /** Range mode: the anchor-to-preview span while a pick is in progress; defaults to `selected`. */
  preview?: DateRange;
  /** Range mode: the in-progress anchor, forwarded to `disabledDate`. */
  anchor?: Date;
  /** Range mode: fires with the pressed day. */
  onSelect?: (date: Date) => void;
  /** Range mode, DOM only: fires with the hovered day, or `null` when the pointer leaves the grid. */
  onHoverChange?: (date: Date | null) => void;
  /** Range mode: the anchor-aware replacement for `disabled`. */
  disabledDate?: (date: Date, anchor?: Date) => boolean;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Day buttons announce their full date; "20" alone is meaningless to a screen reader. The formatter
// follows the runtime locale so the label is localized wherever the app runs.
const dayLabelFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
const dayLabel = (date: Date) => dayLabelFormatter.format(date);

export function Calendar({
  value,
  onValueChange,
  month: controlledMonth,
  onMonthChange,
  disabled,
  className,
  mode = 'single',
  selected,
  preview,
  anchor,
  onSelect,
  onHoverChange,
  disabledDate,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => value ?? new Date());
  const currentMonth = controlledMonth ?? internalMonth;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const isRange = mode === 'range';
  const range: DateRange = isRange ? (preview ?? selected ?? {}) : {};

  // A value set from outside — a form loading a record, a parent resetting state — must move the
  // view with it. The state is left untouched when the month is controlled or already correct, so
  // this cannot fight the caller or loop.
  const focusDate = isRange ? range.from : value;
  React.useEffect(() => {
    if (controlledMonth || !focusDate) return;
    setInternalMonth((previous) =>
      previous.getFullYear() === focusDate.getFullYear() && previous.getMonth() === focusDate.getMonth()
        ? previous
        : focusDate,
    );
  }, [controlledMonth, focusDate]);

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) onMonthChange(newMonth);
    else setInternalMonth(newMonth);
  };

  const prevMonth = () => handleMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => handleMonthChange(new Date(year, month + 1, 1));

  // Generate day grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const isSelected = (day: number) =>
    Boolean(
      value &&
        value.getFullYear() === year &&
        value.getMonth() === month &&
        value.getDate() === day,
    );

  return (
    <div
      data-slot='calendar'
      data-mode={mode}
      className={cn('w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-sm', className)}
    >
      {/* Header */}
      <div className='flex items-center justify-between pb-3'>
        <button
          type='button'
          aria-label='Previous month'
          onClick={prevMonth}
          className='flex size-7 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground'
        >
          <ChevronLeftIcon className='size-4' />
        </button>
        <div className='text-sm font-semibold' aria-live='polite'>
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          type='button'
          aria-label='Next month'
          onClick={nextMonth}
          className='flex size-7 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground'
        >
          <ChevronRightIcon className='size-4' />
        </button>
      </div>

      {/* Weekday headers */}
      <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground pb-2'>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className='h-6 flex items-center justify-center'>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid. Range mode drops the gap so the anchor-to-end span reads as one band. */}
      <div
        className={cn('grid grid-cols-7 text-center text-sm', isRange ? 'gap-0' : 'gap-1')}
        onMouseLeave={isRange ? () => onHoverChange?.(null) : undefined}
      >
        {/* Leading empty cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className={isRange ? 'h-8 w-full' : 'size-8'} />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isDisabled = isRange
            ? disabledDate
              ? disabledDate(date, anchor)
              : false
            : disabled
              ? disabled(date)
              : false;
          const dayState = isRange ? rangeDayState(range, date) : null;
          // A one-day range is reported as its start, so it needs both corners rounded.
          const singleDay = dayState === 'start' && isSameDay(range.from, range.to ?? range.from);
          const selected = isRange ? dayState === 'start' || dayState === 'end' : isSelected(day);
          const current = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type='button'
              disabled={isDisabled}
              aria-label={dayState === 'middle' ? `${dayLabel(date)}, in selected range` : dayLabel(date)}
              // A button-based picker uses aria-pressed for selection; aria-selected would require
              // full grid semantics, which this widget does not claim.
              aria-pressed={selected}
              aria-current={current ? 'date' : undefined}
              data-range={dayState ?? undefined}
              onMouseEnter={isRange ? () => onHoverChange?.(date) : undefined}
              onClick={() => (isRange ? onSelect?.(date) : onValueChange?.(date))}
              className={cn(
                'flex items-center justify-center font-normal transition-colors',
                isRange ? 'h-8 w-full' : 'size-8 rounded-lg',
                isRange && (dayState === 'start' || dayState === 'end') && 'bg-primary text-primary-foreground font-semibold',
                isRange && dayState === 'middle' && 'bg-primary/10 text-foreground',
                isRange && dayState === 'start' && (singleDay ? 'rounded-lg' : 'rounded-l-lg rounded-r-none'),
                isRange && dayState === 'end' && (singleDay ? 'rounded-lg' : 'rounded-r-lg rounded-l-none'),
                isRange && dayState && 'hover:bg-primary/90',
                isRange && !dayState && current && 'rounded-lg border border-primary font-semibold text-primary',
                isRange && !dayState && !current && 'hover:bg-accent hover:text-accent-foreground',
                !isRange && selected && 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90',
                !isRange && !selected && current && 'border border-primary font-semibold text-primary',
                !isRange && !selected && !current && 'hover:bg-accent hover:text-accent-foreground',
                isDisabled && 'opacity-30 pointer-events-none',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

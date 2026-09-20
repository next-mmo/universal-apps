import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';

export interface CalendarProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
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
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => value ?? new Date());
  const currentMonth = controlledMonth ?? internalMonth;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // A value set from outside — a form loading a record, a parent resetting state — must move the
  // view with it. The state is left untouched when the month is controlled or already correct, so
  // this cannot fight the caller or loop.
  React.useEffect(() => {
    if (controlledMonth || !value) return;
    setInternalMonth((previous) =>
      previous.getFullYear() === value.getFullYear() && previous.getMonth() === value.getMonth()
        ? previous
        : value,
    );
  }, [controlledMonth, value]);

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

      {/* Days grid */}
      <div className='grid grid-cols-7 gap-1 text-center text-sm'>
        {/* Leading empty cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className='size-8' />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isDisabled = disabled ? disabled(date) : false;
          const selected = isSelected(day);
          const current = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type='button'
              disabled={isDisabled}
              aria-label={dayLabel(date)}
              // A button-based picker uses aria-pressed for selection; aria-selected would require
              // full grid semantics, which this widget does not claim.
              aria-pressed={selected}
              aria-current={current ? 'date' : undefined}
              onClick={() => onValueChange?.(date)}
              className={cn(
                'size-8 rounded-lg flex items-center justify-center transition-colors text-sm font-normal',
                selected && 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90',
                !selected && current && 'border border-primary font-semibold text-primary',
                !selected && !current && 'hover:bg-accent hover:text-accent-foreground',
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

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { formatDateShort } from '../../lib/date-format';
import { useRangeSelection } from '../../lib/use-range-selection';
import type { RangeCommitBehavior } from '../../lib/use-range-selection';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DateRangePickerProps {
  value?: [Date, Date];
  /** Receives the committed tuple, or `undefined` when the range is cleared. */
  onValueChange?: (range: [Date, Date] | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Applied to the trigger, so an external `<label htmlFor>` can reach it. */
  id?: string;
  /** Minimum and maximum days the committed range may span, both inclusive. */
  min?: number;
  max?: number;
  /** When true, the committed range is trimmed at the first blocked day rather than including it. */
  excludeDisabled?: boolean;
  /** The anchor is passed as the second argument, so "no end before the anchor" rules work. */
  disabledDate?: (date: Date, anchor?: Date) => boolean;
  /**
   * What dismissing the popover mid-selection does — after the start day but before the end day.
   * `'reset'` (default) discards the pick, `'clear'` clears the value, `'select'` commits the
   * start day alone. A plain open-and-close is unaffected.
   */
  commitBehavior?: RangeCommitBehavior;
  /** Locale for the trigger text and the calendar labels; the runtime locale when omitted. */
  locale?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a range...',
  className,
  disabled,
  id,
  min,
  max,
  excludeDisabled,
  disabledDate,
  commitBehavior,
  locale,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selection = useRangeSelection({
    selected: value ? { from: value[0], to: value[1] } : undefined,
    onSelect: (range) => {
      if (range.from && range.to) {
        onValueChange?.([range.from, range.to]);
        setOpen(false);
        return;
      }
      onValueChange?.(undefined);
    },
    disabledDate,
    min,
    max,
    excludeDisabled,
    commitBehavior,
  });

  const handleOpenChange = (next: boolean) => {
    // Radix only reports user-driven closes; a commit close bypasses this, and `dismiss` itself
    // is a no-op once no pick is in progress.
    if (!next) selection.dismiss();
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className='mr-2 size-4 opacity-70' />
          {value ? `${formatDateShort(value[0], locale)} – ${formatDateShort(value[1], locale)}` : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          locale={locale}
          selected={selection.selected}
          preview={selection.preview}
          anchor={selection.anchor}
          onSelect={selection.press}
          onHoverChange={selection.hover}
          disabledDate={disabledDate}
        />
      </PopoverContent>
    </Popover>
  );
}

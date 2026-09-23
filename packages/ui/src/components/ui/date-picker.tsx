import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { formatDateShort } from '../../lib/date-format';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DatePickerProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Applied to the trigger, so an external `<label htmlFor>` can reach it. */
  id?: string;
  /** Locale for the trigger text and the calendar labels; the runtime locale when omitted. */
  locale?: string;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date...',
  className,
  disabled,
  id,
  locale,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          {value ? formatDateShort(value, locale) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          value={value}
          locale={locale}
          onValueChange={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/cn';
import { formatDayLabel, formatMonthYear, weekdayLabels } from '@package/ui/date-format';
import { isSameDay, rangeDayState } from '@package/ui/use-range-selection';

import type { DateRange } from '@package/ui/use-range-selection';
import type { StyleProp, ViewStyle } from 'react-native';

export interface CalendarProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** `'range'` switches to the controlled range props below; the single-date API is unchanged. */
  mode?: 'single' | 'range';
  /** Range mode: the committed selection. */
  selected?: DateRange;
  /** Range mode: the anchor-to-preview span while a pick is in progress; defaults to `selected`. */
  preview?: DateRange;
  /** Range mode: the in-progress anchor, forwarded to `disabledDate`. */
  anchor?: Date;
  /** Range mode: fires with the pressed day. There is no hover on native — selection is tap-tap. */
  onSelect?: (date: Date) => void;
  /** Range mode: the anchor-aware replacement for `disabled`. */
  disabledDate?: (date: Date, anchor?: Date) => boolean;
  /** Locale for the month, weekday, and day labels; the runtime locale when omitted. */
  locale?: string;
}

export function Calendar({
  value,
  onValueChange,
  month: controlledMonth,
  onMonthChange,
  disabled,
  className,
  style,
  mode = 'single',
  selected,
  preview,
  anchor,
  onSelect,
  disabledDate,
  locale,
}: CalendarProps) {
  const isRange = mode === 'range';
  const range: DateRange = isRange ? (preview ?? selected ?? {}) : {};

  const [internalMonth, setInternalMonth] = useState<Date>(() => value ?? range.from ?? new Date());
  const currentMonth = controlledMonth ?? internalMonth;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = formatMonthYear(new Date(year, month, 1), locale);
  const weekdays = weekdayLabels(locale);

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) onMonthChange(newMonth);
    else setInternalMonth(newMonth);
  };

  const prevMonth = () => handleMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => handleMonthChange(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const isSelected = (day: number) =>
    value &&
    value.getFullYear() === year &&
    value.getMonth() === month &&
    value.getDate() === day;

  return (
    <View
      className={cn('w-72 rounded-2xl border border-border bg-popover p-4 shadow-sm', className)}
      style={style}
    >
      {/* Header */}
      <View className='flex-row items-center justify-between pb-3'>
        <Pressable
          accessibilityRole='button'
          onPress={prevMonth}
          className='size-8 items-center justify-center rounded-lg active:bg-accent'
        >
          <Text className='font-sans text-base font-bold text-foreground'>‹</Text>
        </Pressable>

        <Text className='font-sans text-sm font-semibold text-foreground'>
          {monthLabel}
        </Text>

        <Pressable
          accessibilityRole='button'
          onPress={nextMonth}
          className='size-8 items-center justify-center rounded-lg active:bg-accent'
        >
          <Text className='font-sans text-base font-bold text-foreground'>›</Text>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View className='flex-row justify-between pb-2'>
        {weekdays.map((label, index) => (
          <View key={`weekday-${index}`} className='size-8 items-center justify-center'>
            <Text className='font-sans text-xs font-medium text-muted-foreground'>{label}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View className='flex-row flex-wrap'>
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <View key={`empty-${i}`} className='size-9' />
        ))}

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
          // "20" alone is meaningless to a screen reader; the label announces the full date.
          const label = formatDayLabel(date, locale);
          // A one-day range is reported as its start, so it needs both corners rounded.
          const singleDay = dayState === 'start' && isSameDay(range.from, range.to ?? range.from);
          const selected = isRange ? dayState === 'start' || dayState === 'end' : isSelected(day);
          const current = isToday(day);

          return (
            <Pressable
              key={`day-${day}`}
              accessibilityRole='button'
              accessibilityLabel={dayState === 'middle' ? `${label}, in selected range` : label}
              accessibilityState={{ disabled: isDisabled, selected: Boolean(selected) }}
              disabled={isDisabled}
              onPress={() => (isRange ? onSelect?.(date) : onValueChange?.(date))}
              className={cn(
                'h-9 items-center justify-center',
                isRange ? 'w-9' : 'size-9 rounded-xl',
                isRange && (dayState === 'start' || dayState === 'end') && 'bg-primary',
                isRange && dayState === 'middle' && 'bg-primary/10',
                isRange && dayState === 'start' && (singleDay ? 'rounded-xl' : 'rounded-l-xl rounded-r-none'),
                isRange && dayState === 'end' && (singleDay ? 'rounded-xl' : 'rounded-r-xl rounded-l-none'),
                isRange && !dayState && current && 'rounded-xl border border-primary',
                isRange && !dayState && !current && 'active:bg-accent',
                !isRange && selected && 'bg-primary',
                !isRange && !selected && current && 'border border-primary',
                !isRange && !selected && !current && 'active:bg-accent',
                isDisabled && 'opacity-25',
              )}
            >
              <Text
                className={cn(
                  'font-sans text-sm font-normal text-foreground',
                  selected && 'font-semibold text-primary-foreground',
                  !isRange && !selected && current && 'font-semibold text-primary',
                  isRange && !dayState && current && 'font-semibold text-primary',
                )}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

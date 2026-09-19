import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/cn';

import type { StyleProp, ViewStyle } from 'react-native';

export interface CalendarProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function Calendar({
  value,
  onValueChange,
  month: controlledMonth,
  onMonthChange,
  disabled,
  className,
  style,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState<Date>(() => value ?? new Date());
  const currentMonth = controlledMonth ?? internalMonth;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

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
          {MONTH_NAMES[month]} {year}
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
        {DAYS_OF_WEEK.map((d) => (
          <View key={d} className='size-8 items-center justify-center'>
            <Text className='font-sans text-xs font-medium text-muted-foreground'>{d}</Text>
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
          const isDisabled = disabled ? disabled(date) : false;
          const selected = isSelected(day);
          const current = isToday(day);

          return (
            <Pressable
              key={`day-${day}`}
              accessibilityRole='button'
              disabled={isDisabled}
              onPress={() => onValueChange?.(date)}
              className={cn(
                'size-9 items-center justify-center rounded-xl',
                selected && 'bg-primary',
                !selected && current && 'border border-primary',
                !selected && !current && 'active:bg-accent',
                isDisabled && 'opacity-25',
              )}
            >
              <Text
                className={cn(
                  'font-sans text-sm font-normal text-foreground',
                  selected && 'font-semibold text-primary-foreground',
                  !selected && current && 'font-semibold text-primary',
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

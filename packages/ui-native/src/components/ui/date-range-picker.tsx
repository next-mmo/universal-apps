import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/cn';
import { formatDateShort } from '@package/ui/date-format';
import { useRangeSelection } from '@package/ui/use-range-selection';
import { Calendar } from './calendar';

import type { RangeCommitBehavior } from '@package/ui/use-range-selection';
import type { StyleProp, ViewStyle } from 'react-native';

export interface DateRangePickerProps {
  value?: [Date, Date];
  /** Receives the committed tuple, or `undefined` when the range is cleared. */
  onValueChange?: (range: [Date, Date] | undefined) => void;
  placeholder?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Minimum and maximum days the committed range may span, both inclusive. */
  min?: number;
  max?: number;
  /** When true, the committed range is trimmed at the first blocked day rather than including it. */
  excludeDisabled?: boolean;
  /** The anchor is passed as the second argument, so "no end before the anchor" rules work. */
  disabledDate?: (date: Date, anchor?: Date) => boolean;
  /**
   * What dismissing the modal mid-selection does — after the start day but before the end day.
   * `'reset'` (default on native) discards the pick, `'clear'` clears the value, `'select'`
   * commits the start day alone. A plain open-and-close is unaffected.
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
  style,
  disabled,
  min,
  max,
  excludeDisabled,
  disabledDate,
  commitBehavior,
  locale,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

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

  const close = () => {
    selection.dismiss();
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'h-10 w-full flex-row items-center justify-between rounded-xl border border-input bg-card px-3 active:opacity-80',
          disabled && 'opacity-40',
          className,
        )}
        style={style}
      >
        <Text
          className={cn(
            'font-sans text-sm',
            value ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {value ? `${formatDateShort(value[0], locale)} – ${formatDateShort(value[1], locale)}` : placeholder}
        </Text>
        <Text className='font-sans text-xs text-muted-foreground'>📅</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType='fade'
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable className='flex-1 items-center justify-center bg-black/35 px-4' onPress={close}>
          <View onStartShouldSetResponder={() => true}>
            <Calendar
              mode='range'
              locale={locale}
              selected={selection.selected}
              preview={selection.preview}
              anchor={selection.anchor}
              onSelect={selection.press}
              disabledDate={disabledDate}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

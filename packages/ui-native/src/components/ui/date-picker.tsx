import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/cn';
import { formatDateShort } from '@package/ui/date-format';
import { Calendar } from './calendar';

import type { StyleProp, ViewStyle } from 'react-native';

export interface DatePickerProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Locale for the trigger text and the calendar labels; the runtime locale when omitted. */
  locale?: string;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date...',
  className,
  style,
  disabled,
  locale,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        accessibilityRole='button'
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
          {value ? formatDateShort(value, locale) : placeholder}
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
              value={value}
              locale={locale}
              onValueChange={(date) => {
                onValueChange?.(date);
                close();
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

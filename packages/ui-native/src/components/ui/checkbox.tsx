import { Pressable, Text } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface CheckboxProps extends Omit<ComponentProps<typeof Pressable>, 'style'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Checkbox: 16px box, filled when checked. */
export function Checkbox({
  checked = false,
  onCheckedChange,
  invalid = false,
  disabled,
  className,
  style,
  ...props
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole='checkbox'
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        'size-4 shrink-0 items-center justify-center rounded-[4px] border active:opacity-80',
        invalid ? 'border-destructive' : checked ? 'border-primary bg-primary' : 'border-input bg-transparent',
        disabled && 'opacity-50',
        className,
      )}
      style={style}
      {...props}
    >
      {checked ? <Text className='text-[11px] font-semibold leading-none text-primary-foreground'>✓</Text> : null}
    </Pressable>
  );
}

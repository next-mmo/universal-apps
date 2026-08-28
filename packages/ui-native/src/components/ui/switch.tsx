import { Pressable, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface SwitchProps extends Omit<ComponentProps<typeof Pressable>, 'onChange' | 'style'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Switch (green-on track like the iOS/DOM version). */
export function Switch({ checked = false, onCheckedChange, disabled, className, style, ...props }: SwitchProps) {
  return (
    <Pressable
      accessibilityRole='switch'
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        'h-[31px] w-[51px] flex-row items-center rounded-full p-[2px] active:opacity-80',
        checked ? 'bg-green' : 'bg-fill',
        disabled && 'opacity-40',
        className,
      )}
      style={style}
      {...props}
    >
      <View
        className={cn('size-[27px] rounded-full bg-white', checked ? 'translate-x-5' : 'translate-x-0')}
      />
    </Pressable>
  );
}

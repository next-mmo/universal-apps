import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

import { cn } from '../../../ui/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface SwitchProps extends Omit<ComponentProps<typeof Pressable>, 'onChange' | 'style'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Switch with 60 FPS native driver spring physics. */
export function Switch({ checked = false, onCheckedChange, disabled, className, style, ...props }: SwitchProps) {
  const translateX = useRef(new Animated.Value(checked ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: checked ? 20 : 0,
      damping: 24,
      stiffness: 320,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [checked, translateX]);

  return (
    <Pressable
      accessibilityRole='switch'
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        'h-[31px] w-[51px] flex-row items-center rounded-full p-[2px] active:opacity-90',
        checked ? 'bg-green' : 'bg-fill',
        disabled && 'opacity-40',
        className,
      )}
      style={style}
      {...props}
    >
      <Animated.View
        style={{ transform: [{ translateX }] }}
        className='size-[27px] rounded-full bg-white shadow-sm'
      />
    </Pressable>
  );
}

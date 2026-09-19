import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';

export const toggleVariants = {
  variant: {
    default: {
      off: 'bg-transparent',
      on: 'bg-accent',
    },
    outline: {
      off: 'border border-input bg-transparent',
      on: 'border border-input bg-accent',
    },
  },
  size: {
    default: 'h-9 px-3 min-w-9',
    sm: 'h-8 px-2 min-w-8',
    lg: 'h-10 px-4 min-w-10',
  },
  text: {
    off: 'text-foreground',
    on: 'text-accent-foreground font-medium',
  },
};

export interface ToggleProps {
  variant?: ToggleVariant;
  size?: ToggleSize;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  textClassName?: string;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export function Toggle({
  variant = 'default',
  size = 'default',
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  disabled = false,
  className,
  style,
  textClassName,
  textStyle,
  children,
  ...props
}: ToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
  const isControlled = controlledPressed !== undefined;
  const isPressed = isControlled ? controlledPressed : uncontrolledPressed;

  const handlePress = () => {
    if (disabled) return;
    const next = !isPressed;
    if (!isControlled) {
      setUncontrolledPressed(next);
    }
    onPressedChange?.(next);
  };

  const variantStyles = toggleVariants.variant[variant] ?? toggleVariants.variant.default;
  const sizeStyle = toggleVariants.size[size] ?? toggleVariants.size.default;
  const stateStyle = isPressed ? variantStyles.on : variantStyles.off;
  const textStateStyle = isPressed ? toggleVariants.text.on : toggleVariants.text.off;

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected: isPressed, disabled }}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        'flex-row items-center justify-center rounded-lg gap-2',
        sizeStyle,
        stateStyle,
        disabled && 'opacity-50',
        className,
      )}
      style={style}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={cn('text-sm', textStateStyle, textClassName)} style={textStyle}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

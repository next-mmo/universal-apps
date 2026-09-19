import { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';
import { Toggle } from './toggle';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ToggleSize, ToggleVariant } from './toggle';

type ToggleGroupContextValue = {
  type: 'single' | 'multiple';
  value: string | string[];
  onItemToggle: (itemValue: string) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

type SingleToggleGroupProps = {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type MultipleToggleGroupProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ToggleGroupProps = (SingleToggleGroupProps | MultipleToggleGroupProps) & {
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function ToggleGroup({
  variant,
  size,
  disabled = false,
  className,
  style,
  children,
  ...props
}: ToggleGroupProps) {
  const isSingle = props.type === 'single';

  const onItemToggle = (itemValue: string) => {
    if (disabled) return;
    if (isSingle) {
      const nextValue = props.value === itemValue ? '' : itemValue;
      props.onValueChange?.(nextValue);
    } else {
      const currentValues = Array.isArray(props.value) ? props.value : [];
      const nextValues = currentValues.includes(itemValue)
        ? currentValues.filter((v) => v !== itemValue)
        : [...currentValues, itemValue];
      props.onValueChange?.(nextValues);
    }
  };

  const contextValue = useMemo<ToggleGroupContextValue>(
    () => ({
      type: props.type,
      value: props.value ?? (isSingle ? '' : []),
      onItemToggle,
      variant,
      size,
      disabled,
    }),
    [props.type, props.value, variant, size, disabled],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View
        className={cn('flex-row items-center gap-1 rounded-lg', className)}
        style={style}
      >
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps {
  value: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function ToggleGroupItem({
  value,
  variant,
  size,
  disabled,
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const isPressed = context
    ? context.type === 'single'
      ? context.value === value
      : Array.isArray(context.value) && context.value.includes(value)
    : false;

  const itemDisabled = disabled || context?.disabled;

  return (
    <Toggle
      pressed={isPressed}
      disabled={itemDisabled}
      variant={variant ?? context?.variant}
      size={size ?? context?.size}
      onPressedChange={() => context?.onItemToggle(value)}
      className={className}
      {...props}
    >
      {children}
    </Toggle>
  );
}

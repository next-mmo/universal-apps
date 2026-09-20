import { createContext, useCallback, useContext, useMemo } from 'react';

import { cn } from '../../lib/cn';
import { Toggle, toggleVariants } from './toggle';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

type ToggleGroupContextValue = {
  type: 'single' | 'multiple';
  value: string | string[];
  onItemToggle: (itemValue: string) => void;
  variant?: VariantProps<typeof toggleVariants>['variant'];
  size?: VariantProps<typeof toggleVariants>['size'];
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

export type ToggleGroupProps = ComponentProps<'div'> &
  (SingleToggleGroupProps | MultipleToggleGroupProps) & {
    variant?: VariantProps<typeof toggleVariants>['variant'];
    size?: VariantProps<typeof toggleVariants>['size'];
    disabled?: boolean;
  };

export function ToggleGroup({
  className,
  variant,
  size,
  disabled = false,
  children,
  ...props
}: ToggleGroupProps) {
  const isSingle = props.type === 'single';

  const onItemToggle = useCallback(
    (itemValue: string) => {
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
    },
    [disabled, isSingle, props],
  );

  const contextValue = useMemo<ToggleGroupContextValue>(
    () => ({
      type: props.type,
      value: props.value ?? (isSingle ? '' : []),
      onItemToggle,
      variant,
      size,
      disabled,
    }),
    [props, isSingle, onItemToggle, variant, size, disabled],
  );

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        role='group'
        data-slot='toggle-group'
        className={cn('inline-flex items-center gap-1 rounded-lg', className)}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export interface ToggleGroupItemProps
  extends Omit<ComponentProps<typeof Toggle>, 'value'> {
  value: string;
}

export function ToggleGroupItem({
  className,
  value,
  variant,
  size,
  disabled,
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
      data-slot='toggle-group-item'
      pressed={isPressed}
      disabled={itemDisabled}
      variant={variant ?? context?.variant}
      size={size ?? context?.size}
      onPressedChange={() => context?.onItemToggle(value)}
      className={cn(className)}
      {...props}
    />
  );
}

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';

import { cn } from '@package/ui/cn';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionContextValue {
  openValue: string | undefined;
  toggle: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion.* must be used within <Accordion>');
  return ctx;
}

/** RN port of the Radix Accordion with smooth LayoutAnimation on toggle. */
export function Accordion({
  value,
  defaultValue,
  onValueChange,
  type = 'single',
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  type?: 'single' | 'multiple';
  children?: ReactNode;
}) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const openValue = value !== undefined ? value : internal;

  const toggle = useCallback(
    (item: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const next = openValue === item ? undefined : item;
      if (value === undefined) setInternal(next);
      onValueChange?.(next ?? '');
    },
    [openValue, value, onValueChange],
  );

  const contextValue = useMemo(
    () => ({ openValue, toggle, type }),
    [openValue, toggle, type],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      {children}
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = createContext<{ value: string } | null>(null);

export function AccordionItem({
  value,
  className,
  style,
  children,
}: {
  value: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const { openValue } = useAccordion();
  const open = openValue === value;
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <View className={cn(open ? '' : 'border-b border-border', className)} style={style}>
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  value: explicitValue,
  className,
  style,
  children,
}: {
  value?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const { openValue, toggle } = useAccordion();
  const itemCtx = useContext(AccordionItemContext);
  const value = explicitValue ?? itemCtx?.value ?? '';
  const open = openValue === value;
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ expanded: open }}
      onPress={() => toggle(value)}
      className={cn('flex-row items-center justify-between gap-4 py-4 active:opacity-80', className)}
      style={style}
    >
      <Text className='flex-1 font-sans text-sm font-medium text-foreground'>{children}</Text>
      <Text className={cn('font-sans text-sm text-muted-foreground', open ? 'rotate-180' : '')}>⌄</Text>
    </Pressable>
  );
}

export function AccordionContent({
  value: explicitValue,
  className,
  style,
  children,
}: {
  value?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const { openValue } = useAccordion();
  const itemCtx = useContext(AccordionItemContext);
  const value = explicitValue ?? itemCtx?.value ?? '';
  const open = openValue === value;
  if (!open) return null;
  return (
    <View className={cn('pb-4', className)} style={style}>
      {children}
    </View>
  );
}

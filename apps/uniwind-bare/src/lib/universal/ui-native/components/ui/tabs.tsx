import { createContext, useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '../../../ui/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

interface TabsContextValue {
  active: string | undefined;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used within <Tabs>');
  return ctx;
}

/** RN port of the Radix Tabs: segmented control + content panel. */
export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  style,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const active = value !== undefined ? value : internal;
  const setActive = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <View className={cn('flex-col gap-2', className)} style={style}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className={cn('flex-row self-start items-center rounded-lg bg-muted p-[3px]', className)}
      style={style}
    >
      {children}
    </View>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  style,
}: {
  value: string;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { active, setActive } = useTabs();
  const selected = active === value;
  return (
    <Pressable
      accessibilityRole='tab'
      accessibilityState={{ selected }}
      onPress={() => setActive(value)}
      className={cn(
        'flex-row items-center justify-center rounded-md px-2 py-1 active:opacity-80',
        selected ? 'bg-background shadow-sm' : '',
        className,
      )}
      style={style}
    >
      <Text
        className={cn(
          'font-sans text-sm font-medium',
          selected ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TabsContent({
  value,
  children,
  className,
  style,
}: {
  value: string;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { active } = useTabs();
  if (active !== value) return null;
  return (
    <View className={cn('flex-1', className)} style={style}>
      {children}
    </View>
  );
}

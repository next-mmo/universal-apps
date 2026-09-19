import { ScrollView, Text, View } from 'react-native';

import { cn } from '../../../ui/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

interface TableSlotProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * RN port of `@package/ui` Table: rows become flex Views since RN has no
 * table primitives; the container scrolls horizontally like the DOM wrapper.
 */
export function Table({ className, style, children }: TableSlotProps) {
  return (
    <ScrollView horizontal contentContainerStyle={{ minWidth: '100%' }}>
      <View className={cn('w-full', className)} style={style}>
        {children}
      </View>
    </ScrollView>
  );
}

export function TableHeader({ className, style, children }: TableSlotProps) {
  return <View className={cn('w-full', className)} style={style}>{children}</View>;
}

export function TableBody({ className, style, children }: TableSlotProps) {
  return <View className={cn('flex-col', className)} style={style}>{children}</View>;
}

export function TableFooter({ className, style, children }: TableSlotProps) {
  return (
    <View className={cn('border-t border-border bg-muted/50', className)} style={style}>
      {children}
    </View>
  );
}

export function TableRow({ className, style, children }: TableSlotProps) {
  return (
    <View className={cn('flex-row border-b border-border', className)} style={style}>
      {children}
    </View>
  );
}

export function TableHead({ className, style, children }: TableSlotProps) {
  return (
    <View className={cn('flex-1 px-3 py-2.5', className)} style={style}>
      <Text className='font-sans text-xs font-semibold tracking-[0.02em] text-muted-foreground'>
        {children}
      </Text>
    </View>
  );
}

export function TableCell({ className, style, children }: TableSlotProps) {
  return <View className={cn('flex-1 px-3 py-2.5', className)} style={style}>{children}</View>;
}

export function TableCaption({ className, style, children }: { className?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return (
    <View className={cn('mt-4 items-center justify-center', className)} style={style}>
      <Text className='font-sans text-sm text-muted-foreground'>{children}</Text>
    </View>
  );
}

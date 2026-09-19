import { Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface SlotProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

interface TextSlotProps {
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
}

/** RN port of `@package/ui` Card with the DOM slot classes. */
export function Card({ className, style, children }: SlotProps) {
  return (
    <View
      className={cn(
        'flex-col gap-6 overflow-hidden rounded-xl border border-border bg-card py-6 shadow-[var(--shadow-card)]',
        className,
      )}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, style, children }: SlotProps) {
  return <View className={cn('flex-col gap-1.5 px-6', className)} style={style}>{children}</View>;
}

export function CardTitle({ className, style, children }: TextSlotProps) {
  return (
    <Text className={cn('font-sans text-base font-semibold leading-none text-card-foreground', className)} style={style}>
      {children}
    </Text>
  );
}

export function CardDescription({ className, style, children }: TextSlotProps) {
  return (
    <Text className={cn('font-sans text-sm text-muted-foreground', className)} style={style}>
      {children}
    </Text>
  );
}

export function CardAction({ className, style, children }: SlotProps) {
  return <View className={cn('ml-auto self-start', className)} style={style}>{children}</View>;
}

export function CardContent({ className, style, children }: SlotProps) {
  return <View className={cn('px-6', className)} style={style}>{children}</View>;
}

export function CardFooter({ className, style, children }: SlotProps) {
  return <View className={cn('flex-row items-center justify-end px-6', className)} style={style}>{children}</View>;
}


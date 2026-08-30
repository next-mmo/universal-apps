import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

/**
 * RN port of the Radix Dialog: centered card over a dimmed backdrop,
 * driven by `open`/`onOpenChange` like the DOM version. Layout parts are
 * exported so DOM JSX trees port with minimal edits.
 */
export function Dialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}) {
  const close = () => onOpenChange?.(false);
  return (
    <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
      <Pressable className='flex-1 items-center justify-center bg-black/25 px-4' onPress={close}>
        <View
          className='w-full gap-4 rounded-2xl border border-border bg-popover p-6'
          onStartShouldSetResponder={() => true}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export function DialogTrigger({
  children,
  asChild,
  ...props
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  // The DOM trigger is redundant when the parent controls `open`; rendered
  // as a passthrough for API parity.
  return (
    <View {...props}>
      {children}
    </View>
  );
}

export function DialogHeader({ className, style, children }: { className?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return <View className={cn('gap-2', className)} style={style}>{children}</View>;
}

export function DialogFooter({ className, style, children }: { className?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }) {
  return <View className={cn('flex-row justify-end gap-2', className)} style={style}>{children}</View>;
}

export function DialogTitle({ className, style, children }: { className?: string; style?: StyleProp<TextStyle>; children?: ReactNode }) {
  return (
    <Text className={cn('font-sans text-lg font-semibold leading-none text-foreground', className)} style={style}>
      {children}
    </Text>
  );
}

export function DialogDescription({ className, style, children }: { className?: string; style?: StyleProp<TextStyle>; children?: ReactNode }) {
  return (
    <Text className={cn('font-sans text-sm text-muted-foreground', className)} style={style}>
      {children}
    </Text>
  );
}

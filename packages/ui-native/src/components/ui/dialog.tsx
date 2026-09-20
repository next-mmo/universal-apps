import { createContext, useContext } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

const DialogContext = createContext<{ close: () => void } | null>(null);

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
    <DialogContext.Provider value={{ close }}>
      <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
        {open ? (
          <Pressable className='flex-1 items-center justify-center bg-black/50 px-4' onPress={close}>
            <View
              className='w-full gap-4 rounded-2xl border border-border bg-popover p-6'
              onStartShouldSetResponder={() => true}
            >
              {children}
            </View>
          </Pressable>
        ) : null}
      </Modal>
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild: _asChild,
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

export function DialogContent({
  className,
  style,
  children,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return <View className={cn('gap-4', className)} style={style}>{children}</View>;
}

export function DialogClose({
  children,
  onPress,
  className,
  style,
  ...props
}: {
  children?: ReactNode;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const ctx = useContext(DialogContext);
  const handlePress = () => {
    onPress?.();
    ctx?.close();
  };
  return (
    <Pressable accessibilityRole='button' onPress={handlePress} className={className} style={style} {...props}>
      {children}
    </Pressable>
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

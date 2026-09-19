import { createContext, useContext } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '../../../ui/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

const DrawerContext = createContext<{ close: () => void } | null>(null);

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Drawer({
  open = false,
  onOpenChange,
  children,
}: DrawerProps) {
  const close = () => onOpenChange?.(false);
  return (
    <DrawerContext.Provider value={{ close }}>
      <Modal
        visible={open}
        transparent
        animationType='slide'
        onRequestClose={close}
        statusBarTranslucent
      >
        <View className='flex-1 justify-end bg-black/40'>
          <Pressable className='flex-1' onPress={close} />
          <View
            className='max-h-[85%] rounded-t-3xl border-t border-border bg-popover px-6 pb-8 pt-3 shadow-2xl'
            onStartShouldSetResponder={() => true}
          >
            <View className='mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/80' />
            {children}
          </View>
        </View>
      </Modal>
    </DrawerContext.Provider>
  );
}

export function DrawerPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DrawerOverlay({
  className,
  ...props
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <View className={cn('absolute inset-0 bg-black/40', className)} {...props} />;
}

export function DrawerTrigger({
  children,
  ...props
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  return <View {...props}>{children}</View>;
}

export function DrawerClose({
  children,
  onPress,
  className,
  style,
  ...props
}: {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const ctx = useContext(DrawerContext);
  return (
    <Pressable
      onPress={() => {
        onPress?.();
        ctx?.close();
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export function DrawerContent({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <View className={cn('gap-4', className)} {...props}>
      {children}
    </View>
  );
}

export function DrawerHeader({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <View className={cn('gap-1.5 pb-2 text-center', className)} {...props}>
      {children}
    </View>
  );
}

export function DrawerFooter({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <View className={cn('mt-auto flex-row justify-end gap-2 pt-4', className)} {...props}>
      {children}
    </View>
  );
}

export function DrawerTitle({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
}) {
  return (
    <Text
      className={cn('text-lg font-semibold text-foreground', className)}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export function DrawerDescription({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
}) {
  return (
    <Text
      className={cn('text-sm text-muted-foreground', className)}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

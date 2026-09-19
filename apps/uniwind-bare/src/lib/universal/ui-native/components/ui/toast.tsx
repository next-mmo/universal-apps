import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { cn } from '../../../ui/lib/cn';
import { toast, toastStore, type ToastAction, type ToastData } from '../../../ui/components/ui/toast';

import type { StyleProp, ViewStyle } from 'react-native';

export { toast, toastStore, type ToastAction, type ToastData };

function ToastItem({ item, onDismiss }: { item: ToastData; onDismiss: (id: string) => void }) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 280,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(item.id);
    });
  };

  return (
    <Animated.View
      style={[
        { transform: [{ translateY }], opacity },
      ]}
      className={cn(
        'w-full flex-row items-center gap-3 rounded-2xl border border-border bg-popover p-4 shadow-xl',
        item.variant === 'error' && 'border-destructive/40 bg-destructive/10',
        item.variant === 'success' && 'border-green/40 bg-green/10',
        item.variant === 'warning' && 'border-orange/40 bg-orange/10',
      )}
    >
      <View className='flex-1 gap-1'>
        <Text
          className={cn(
            'font-sans text-sm font-semibold text-foreground',
            item.variant === 'error' && 'text-destructive',
          )}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text className='font-sans text-xs text-muted-foreground'>{item.description}</Text>
        )}
      </View>

      {item.action && (
        <Pressable
          accessibilityRole='button'
          onPress={() => {
            item.action?.onClick();
            handleDismiss();
          }}
          className='rounded-lg bg-secondary px-3 py-1.5 active:opacity-80'
        >
          <Text className='font-sans text-xs font-semibold text-secondary-foreground'>
            {item.action.label}
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole='button'
        onPress={handleDismiss}
        className='p-1 opacity-70 active:opacity-100'
      >
        <Text className='font-sans text-sm text-muted-foreground'>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ToasterProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/** Native Toaster overlay rendering 60 FPS spring-animated stacked toasts. */
export function Toaster({ style, className }: ToasterProps) {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => [] as ToastData[],
  );

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents='box-none'
      style={style}
      className={cn('absolute bottom-10 left-4 right-4 z-50 gap-2', className)}
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={(id) => toast.dismiss(id)} />
      ))}
    </View>
  );
}

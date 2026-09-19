import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const InteractiveDrawerContext = createContext<{ close: () => void } | null>(null);

export interface InteractiveDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  snapHeight?: number;
  children?: ReactNode;
}

/**
 * 120 FPS gesture-driven bottom sheet powered by react-native-reanimated
 * and react-native-gesture-handler. Runs worklets on the native UI thread
 * with finger-tracking, rubber-banding, and velocity-based flick dismiss.
 */
export function InteractiveDrawer({
  open = false,
  onOpenChange,
  snapHeight = 420,
  children,
}: InteractiveDrawerProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const close = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(snapHeight, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(close)();
      }
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [close, snapHeight, translateY, backdropOpacity]);

  useEffect(() => {
    if (open) {
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 280,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [open, snapHeight, translateY, backdropOpacity]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Allow downward drag; add rubber-banding resistance if pulled upward
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      } else {
        translateY.value = event.translationY * 0.2;
      }
    })
    .onEnd((event) => {
      // Dismiss if dragged down more than 35% of height or flicked downward with velocity
      if (event.translationY > snapHeight * 0.35 || event.velocityY > 600) {
        translateY.value = withTiming(snapHeight, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(close)();
          }
        });
        backdropOpacity.value = withTiming(0, { duration: 180 });
      } else {
        // Snap back to open position
        translateY.value = withSpring(0, {
          damping: 22,
          stiffness: 260,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.45,
  }));

  const contextValue = useMemo(() => ({ close: handleClose }), [handleClose]);

  if (!open) return null;

  return (
    <InteractiveDrawerContext.Provider value={contextValue}>
      <Modal
        visible={open}
        transparent
        animationType='none'
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View className='flex-1 justify-end'>
          {/* Animated Backdrop */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'black',
              },
              backdropStyle,
            ]}
          >
            <Pressable className='flex-1' onPress={handleClose} />
          </Animated.View>

          {/* Gesture-driven Sheet Content */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[sheetStyle, { maxHeight: snapHeight }]}
              className='rounded-t-3xl border-t border-border bg-popover px-6 pb-8 pt-3 shadow-2xl'
            >
              {/* Grab Handle */}
              <View className='mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/80' />
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    </InteractiveDrawerContext.Provider>
  );
}

export function InteractiveDrawerClose({
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
  const ctx = useContext(InteractiveDrawerContext);
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

export function InteractiveDrawerContent({
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

export function InteractiveDrawerHeader({
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

export function InteractiveDrawerFooter({
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

export function InteractiveDrawerTitle({
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

export function InteractiveDrawerDescription({
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

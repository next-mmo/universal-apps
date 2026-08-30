import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * RN port of `@package/ui` Skeleton. Tailwind's `animate-pulse` has no
 * keyframe equivalent in Uniwind, so the pulse uses RN's Animated with a
 * sine fade matching the CSS timing (2s cycle, 50% opacity dip).
 */
export function Skeleton({
  className,
  style,
  ...props
}: ComponentProps<typeof View> & { className?: string; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View
      className={cn('rounded-md bg-accent', className)}
      style={[style, { opacity }]}
      {...props}
    />
  );
}

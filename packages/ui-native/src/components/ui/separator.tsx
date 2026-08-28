import { View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { StyleProp, ViewStyle } from 'react-native';

export function Separator({
  orientation = 'horizontal',
  className,
  style,
}: {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className={cn(
        'shrink-0 self-stretch bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px',
        className,
      )}
      style={style}
    />
  );
}

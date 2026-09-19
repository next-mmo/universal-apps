import { Text } from 'react-native';

import { cn } from '../../../ui/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

/** RN port of `@package/ui` Label. */
export function Label({
  className,
  style,
  children,
  ...props
}: ComponentProps<typeof Text> & {
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: ComponentProps<typeof Text>['children'];
}) {
  return (
    <Text
      className={cn('font-sans text-sm font-medium leading-none text-foreground', className)}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

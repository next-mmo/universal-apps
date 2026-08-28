import { Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-primary/12', text: 'text-primary' },
  secondary: { container: 'bg-fill', text: 'text-muted-foreground' },
  destructive: { container: 'bg-destructive/12', text: 'text-destructive' },
  success: { container: 'bg-green/15', text: 'text-green' },
  warning: { container: 'bg-orange/15', text: 'text-orange' },
  outline: { container: 'border-border bg-transparent', text: 'text-muted-foreground' },
};

/** RN port of `@package/ui` Badge with the DOM variant strings (tinted fills). */
export function Badge({
  variant = 'default',
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}) {
  const variantClass = variantClasses[variant];
  return (
    <View
      className={cn(
        'flex-row self-start overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 font-sans',
        variantClass.container,
        className,
      )}
    >
      <Text className={cn('text-[11px] font-semibold tracking-[-0.01em]', variantClass.text)}>
        {children}
      </Text>
    </View>
  );
}

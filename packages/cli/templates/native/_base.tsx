import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

import type { ComponentProps } from 'react';

/**
 * Base placeholder — the CLI falls back to this template when no
 * `<name>.tsx` template exists. Port the component from its DOM sibling
 * in `packages/ui/src/components/ui`, keeping the same prop API and
 * mirroring its Tailwind classes 1:1 — Uniwind compiles them for RN
 * (colors ride the tokens.css variables, so `dark:` variants work).
 */
export function BaseNative({
  className,
  style,
}: {
  className?: string;
  style?: ComponentProps<typeof View>['style'];
}) {
  return (
    <View className={cn('rounded-[10px] bg-secondary p-4', className)} style={style}>
      <Text className='font-sans text-[13px] text-muted-foreground'>
        Scaffolded component — port the real implementation here.
      </Text>
    </View>
  );
}

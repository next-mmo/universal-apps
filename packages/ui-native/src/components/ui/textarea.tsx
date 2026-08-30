import { Platform, TextInput, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

import { cn } from '@package/ui/src/lib/cn';

import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface TextareaProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
  invalid?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Textarea; multiline TextInput inside a bordered box. */
export function Textarea({ invalid = false, className, style, ...props }: TextareaProps) {
  const resolved = useCSSVariable('--color-muted-foreground');
  const placeholderColor = typeof resolved === 'string' ? resolved : undefined;

  return (
    <View
      className={cn(
        'w-full rounded-[10px] border border-input bg-transparent px-3 py-2',
        invalid && 'border-destructive',
        className,
      )}
      style={style}
    >
      <TextInput
        multiline
        className='w-full font-sans text-sm text-foreground'
        placeholderTextColor={placeholderColor}
        style={Platform.select({ web: { outlineWidth: 0 as unknown as number } })}
        {...props}
      />
    </View>
  );
}

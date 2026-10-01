import { Platform, TextInput, View } from 'react-native';
import { useThemeColor } from '../../lib/theme-token';
import { cn } from '@package/ui/cn';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface TextareaProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
  invalid?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Textarea; multiline TextInput inside a bordered box across Uniwind & Nativewind. */
export function Textarea({ invalid = false, className, style, placeholderTextColor, ...props }: TextareaProps) {
  const defaultPlaceholder = useThemeColor('--color-muted-foreground', '#8e8e93');

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
        className="w-full font-sans text-sm text-foreground"
        placeholderTextColor={placeholderTextColor ?? defaultPlaceholder}
        style={Platform.select({ web: { outlineWidth: 0 as unknown as number } })}
        {...props}
      />
    </View>
  );
}

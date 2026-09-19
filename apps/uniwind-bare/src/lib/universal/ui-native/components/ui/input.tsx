import { Platform, Text, TextInput, View } from 'react-native';
import { useCSSVariable } from 'uniwind';
import { cn } from '../../../ui/lib/cn';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
export interface InputProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
    invalid?: boolean;
    className?: string;
    style?: StyleProp<ViewStyle>;
}
/** RN port of Input; forwards all native TextInput props and shares radius tokens. */
export function Input({ invalid = false, className, style, ...props }: InputProps) {
    const resolved = useCSSVariable('--color-muted-foreground');
    const placeholderColor = typeof resolved === 'string' ? resolved : undefined;
    return <View className={cn('h-9 w-full flex-row items-center rounded-md border border-input bg-fill px-3', invalid && 'border-destructive', className)} style={style}>
    <TextInput accessibilityRole='text' placeholderTextColor={placeholderColor} className='h-full flex-1 font-sans text-sm text-foreground' style={Platform.select({
            web: {
                outlineWidth: 0 as unknown as number
            }
        })} {...props}/>
  </View>;
}
export function InputLabel({ className, style, children }: {
    className?: string;
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
}) {
    return <Text className={cn('mb-1.5 font-sans text-[13px] font-medium text-foreground', className)} style={style}>{children}</Text>;
}

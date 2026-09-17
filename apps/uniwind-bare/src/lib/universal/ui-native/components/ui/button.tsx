import { Pressable, Text } from 'react-native';
import { cn } from '../../../ui/lib/cn';
import type { ComponentProps, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
export interface ButtonProps extends Omit<ComponentProps<typeof Pressable>, 'children' | 'style'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
}
const variantClasses: Record<ButtonVariant, {
    container: string;
    text: string;
}> = {
    default: {
        container: 'bg-primary', text: 'text-primary-foreground'
    },
    secondary: {
        container: 'bg-secondary', text: 'text-secondary-foreground'
    },
    destructive: {
        container: 'bg-destructive', text: 'text-destructive-foreground'
    },
    outline: {
        container: 'border border-border bg-card', text: 'text-card-foreground'
    },
    ghost: {
        container: 'bg-transparent', text: 'text-primary'
    },
    link: {
        container: 'bg-transparent', text: 'text-primary'
    },
};
const sizeClasses: Record<ButtonSize, {
    container: string;
    text: string;
}> = {
    default: {
        container: 'h-9 px-4', text: 'text-sm'
    },
    sm: {
        container: 'h-8 gap-1 px-3', text: 'text-[13px]'
    },
    lg: {
        container: 'h-11 px-6', text: 'text-base'
    },
    icon: {
        container: 'h-9 w-9 px-0', text: 'text-sm'
    },
};
/** Shared semantic radius, with native text styling kept on the inner Text. */
export function Button({ className, variant = 'default', size = 'default', style, disabled, onPress, children, ...props }: ButtonProps) {
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    return <Pressable accessibilityRole='button' accessibilityState={{
            disabled: !!disabled
        }} disabled={disabled} onPress={onPress} className={cn('flex-row items-center justify-center gap-1.5 rounded-md font-sans active:opacity-80', variantClass.container, sizeClass.container, disabled && 'opacity-40', className)} style={style} {...props}>
    {typeof children === 'string' ? <Text className={cn('font-medium tracking-[-0.01em]', variantClass.text, sizeClass.text)}>{children}</Text> : children}
  </Pressable>;
}

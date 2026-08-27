import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../lib/theme';

import type { ComponentProps, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<ComponentProps<typeof Pressable>, 'children' | 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** RN port of `@package/ui` Button; same variant/size names as the DOM version. */
export function Button({ variant = 'default', size = 'default', style, disabled, onPress, children, ...props }: ButtonProps) {
  const { palette, fontFamily } = useTheme();

  const variantStyle = variantStyles(variant, palette);
  const sizeStyle = sizeStyles(size);

  return (
    <Pressable
      accessibilityRole='button'
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) =>
        StyleSheet.flatten([
          styles.base,
          sizeStyle,
          variantStyle,
          disabled ? styles.disabled : null,
          pressed ? styles.pressed : null,
          style,
        ]) as StyleProp<ViewStyle>
      }
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: variantStyle.color, fontFamily }, sizeStyle.text]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function variantStyles(variant: ButtonVariant, palette: ReturnType<typeof useTheme>['palette']) {
  switch (variant) {
    case 'secondary':
      return { backgroundColor: palette.secondary, color: palette.secondaryForeground, borderWidth: 0 };
    case 'destructive':
      return { backgroundColor: palette.destructive, color: palette.destructiveForeground, borderWidth: 0 };
    case 'outline':
      return { backgroundColor: 'transparent', color: palette.foreground, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.border };
    case 'ghost':
      return { backgroundColor: 'transparent', color: palette.foreground, borderWidth: 0 };
    case 'link':
      return { backgroundColor: 'transparent', color: palette.primary, borderWidth: 0 };
    default:
      return { backgroundColor: palette.primary, color: palette.primaryForeground, borderWidth: 0 };
  }
}

function sizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return { paddingHorizontal: 12, height: 32, borderRadius: 10, text: { fontSize: 13 } };
    case 'lg':
      return { paddingHorizontal: 24, height: 48, borderRadius: 12, text: { fontSize: 16 } };
    case 'icon':
      return { width: 36, height: 36, borderRadius: 10, paddingHorizontal: 0, alignItems: 'center' as const, justifyContent: 'center' as const, text: { fontSize: 14 } };
    default:
      return { paddingHorizontal: 16, height: 40, borderRadius: 10, text: { fontSize: 14 } };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontWeight: '500',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});

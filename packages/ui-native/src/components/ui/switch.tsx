import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../lib/theme';

import type { ComponentProps } from 'react';

export interface SwitchProps extends Omit<ComponentProps<typeof Pressable>, 'onChange' | 'style'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: ComponentProps<typeof View>['style'];
}

/** RN port of `@package/ui` Switch; mirrors the Radix `checked` API shape. */
export function Switch({ checked = false, onCheckedChange, disabled, style, ...props }: SwitchProps) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole='switch'
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      style={[styles.track, { backgroundColor: checked ? palette.primary : palette.fill }, style]}
      {...props}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: '#ffffff',
            transform: [{ translateX: checked ? 20 : 2 }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 999,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
  },
});

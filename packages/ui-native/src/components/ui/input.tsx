import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../lib/theme';

import type { ComponentProps } from 'react';

export interface InputProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
  invalid?: boolean;
  style?: object;
}

/** RN port of `@package/ui` Input; forwards all native TextInput props. */
export function Input({ invalid = false, style, ...props }: InputProps) {
  const { palette, fontFamily } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: 'transparent', borderColor: invalid ? palette.destructive : palette.input },
        style,
      ]}
    >
      <TextInput
        accessibilityRole='text'
        placeholderTextColor={palette.mutedForeground}
        style={[styles.input, { color: palette.foreground, fontFamily }, Platform.select({ web: { outlineWidth: 0 as unknown as number } })]}
        {...props}
      />
    </View>
  );
}

export function InputLabel({ children }: { children?: React.ReactNode }) {
  const { palette, fontFamily } = useTheme();
  return <Text style={{ color: palette.foreground, fontFamily, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 14,
    padding: 0,
    height: '100%',
  },
});

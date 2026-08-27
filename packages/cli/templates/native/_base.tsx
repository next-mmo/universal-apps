import { View, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

import type { ComponentProps } from 'react';

/**
 * Base placeholder — the CLI falls back to this template when no
 * `<name>.tsx` template exists. Port the component from its DOM sibling
 * in `packages/ui/src/components/ui`, keeping the same prop API.
 */
export function BaseNative({ style }: { style?: ComponentProps<typeof View>['style'] }) {
  const { palette, fontFamily } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.secondary }, style]}>
      <Text style={{ color: palette.mutedForeground, fontFamily, fontSize: 13 }}>
        Scaffolded component — port the real implementation here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 10,
    padding: 16,
  },
});

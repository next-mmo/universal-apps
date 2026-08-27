import { Text, View, StyleSheet } from 'react-native';

import { useTheme } from '../../lib/theme';

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

export function Badge({ variant = 'default', children }: { variant?: BadgeVariant; children?: ReactNode }) {
  const { palette, fontFamily } = useTheme();
  const style = variantStyles(variant, palette);
  return (
    <View style={[styles.badge, { backgroundColor: style.background, borderColor: style.border }]}>
      <Text style={{ color: style.color, fontFamily, fontSize: 11, fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

function variantStyles(variant: BadgeVariant, palette: ReturnType<typeof useTheme>['palette']) {
  switch (variant) {
    case 'secondary':
      return { background: palette.secondary, color: palette.secondaryForeground, border: 'transparent' };
    case 'destructive':
      return { background: palette.destructive, color: palette.destructiveForeground, border: 'transparent' };
    case 'outline':
      return { background: 'transparent', color: palette.foreground, border: palette.border };
    case 'success':
      return { background: palette.green, color: '#ffffff', border: 'transparent' };
    case 'warning':
      return { background: palette.orange, color: '#ffffff', border: 'transparent' };
    default:
      return { background: palette.primary, color: palette.primaryForeground, border: 'transparent' };
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});

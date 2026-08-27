import { Text, View, StyleSheet } from 'react-native';

import { useTheme } from '../../lib/theme';

import type { ReactNode } from 'react';

export function Card({ style, children }: { style?: object; children?: ReactNode }) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border, boxShadow: palette.boxShadowCard },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ style, children }: { style?: object; children?: ReactNode }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children }: { children?: ReactNode }) {
  const { palette, fontFamily } = useTheme();
  return <Text style={[styles.title, { color: palette.cardForeground, fontFamily }]}>{children}</Text>;
}

export function CardDescription({ children }: { children?: ReactNode }) {
  const { palette, fontFamily } = useTheme();
  return <Text style={[styles.description, { color: palette.mutedForeground, fontFamily }]}>{children}</Text>;
}

export function CardContent({ style, children }: { style?: object; children?: ReactNode }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ style, children }: { style?: object; children?: ReactNode }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 20,
    gap: 12,
  },
  header: {
    gap: 4,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
});

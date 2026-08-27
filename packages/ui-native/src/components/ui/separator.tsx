import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../lib/theme';

export function Separator({ orientation = 'horizontal', style }: { orientation?: 'horizontal' | 'vertical'; style?: object }) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: palette.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});

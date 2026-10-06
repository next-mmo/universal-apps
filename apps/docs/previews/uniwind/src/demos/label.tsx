import { View } from 'react-native';

import { Input, Label } from '@package/ui-native';

export function LabelDemo() {
  return (
    <View className='w-full max-w-xs gap-2'>
      <Label>Priority</Label>
      <Input accessibilityLabel='Priority' defaultValue='Normal' />
    </View>
  );
}

import { View } from 'react-native';

import { Input, Label } from '@package/ui-native';

export function InputDemo() {
  return (
    <View className='w-full max-w-xs gap-2'>
      <Label>Task</Label>
      <Input accessibilityLabel='Task' placeholder='What needs doing?' />
    </View>
  );
}

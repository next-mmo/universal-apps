import { Text, View } from 'react-native';

import { Separator } from '@package/ui-native';

export function SeparatorDemo() {
  return (
    <View className='w-full max-w-sm'>
      <Text className='font-sans text-sm'>Content above the divider.</Text>
      <Separator className='my-4' />
      <Text className='font-sans text-sm'>Content below the divider.</Text>
    </View>
  );
}

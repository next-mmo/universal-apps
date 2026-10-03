import { View } from 'react-native';

import { Badge } from '@package/ui-native';

export function BadgeDemo() {
  return (
    <View className='flex-row flex-wrap items-center gap-3'>
      <Badge>Default</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='destructive'>Destructive</Badge>
      <Badge variant='outline'>Outline</Badge>
    </View>
  );
}

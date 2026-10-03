import { useState } from 'react';
import { View } from 'react-native';

import { Checkbox, Label } from '@package/ui-native';

export function CheckboxDemo() {
  const [pinned, setPinned] = useState(true);

  return (
    <View className='flex-row flex-wrap items-center gap-3'>
      <View className='flex-row items-center gap-2'>
        <Checkbox checked={pinned} onCheckedChange={setPinned} />
        <Label>Pin to top</Label>
      </View>
      <View className='flex-row items-center gap-2'>
        <Checkbox disabled />
        <Label className='text-muted-foreground'>Disabled</Label>
      </View>
    </View>
  );
}

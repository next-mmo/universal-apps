import { useState } from 'react';
import { View } from 'react-native';

import { Label, Switch } from '@package/ui-native';

export function SwitchDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <View className='flex-row flex-wrap items-center gap-3'>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Label>Surface this task at the top</Label>
    </View>
  );
}

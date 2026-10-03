import { useState } from 'react';
import { View } from 'react-native';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@package/ui-native';

export function SelectDemo() {
  const [value, setValue] = useState('normal');

  return (
    <View>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder='Priority' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='low'>Low</SelectItem>
          <SelectItem value='normal'>Normal</SelectItem>
          <SelectItem value='high'>High</SelectItem>
        </SelectContent>
      </Select>
    </View>
  );
}

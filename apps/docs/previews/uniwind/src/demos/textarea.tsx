import { View } from 'react-native';

import { Label, Textarea } from '@package/ui-native';

export function TextareaDemo() {
  return (
    <View className='w-full max-w-xs gap-2'>
      <Label>Notes</Label>
      <Textarea accessibilityLabel='Notes' placeholder='Optional details…' numberOfLines={3} />
    </View>
  );
}

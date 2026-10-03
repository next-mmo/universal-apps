import { Text, View } from 'react-native';

import { Button } from '@package/ui-native';

export function ButtonDemo() {
  return (
    <View className='gap-3'>
      <View className='flex-row flex-wrap items-center gap-3'>
        <Button>Default</Button>
        <Button variant='secondary'>Secondary</Button>
        <Button variant='destructive'>Destructive</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='link'>Link</Button>
      </View>
      <View className='flex-row flex-wrap items-center gap-3'>
        <Button size='sm' variant='secondary'>Small</Button>
        <Button variant='secondary'>Default</Button>
        <Button size='lg' variant='secondary'>Large</Button>
        <Button size='icon' variant='outline' accessibilityLabel='Add'>
          <Text className='text-foreground'>+</Text>
        </Button>
      </View>
    </View>
  );
}

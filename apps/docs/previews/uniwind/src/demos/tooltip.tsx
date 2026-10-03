import { Text, View } from 'react-native';

import { Button, Tooltip } from '@package/ui-native';

export function TooltipDemo() {
  return (
    <View className='flex-row flex-wrap items-center gap-3'>
      <Tooltip content='More information'>
        <Button variant='ghost' size='icon' accessibilityLabel='Info'>
          <Text className='text-foreground'>i</Text>
        </Button>
      </Tooltip>
      <Text className='font-sans text-sm text-muted-foreground'>Press the icon button.</Text>
    </View>
  );
}

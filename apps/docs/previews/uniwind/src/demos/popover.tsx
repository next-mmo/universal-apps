import { Text } from 'react-native';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@package/ui-native';

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant='outline'>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-64'>
        <Text className='font-sans text-sm font-medium'>Popover title</Text>
        <Text className='font-sans text-sm text-muted-foreground'>
          Any content can live here — forms, filters, hints.
        </Text>
      </PopoverContent>
    </Popover>
  );
}

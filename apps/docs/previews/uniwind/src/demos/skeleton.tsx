import { View } from 'react-native';

import { Skeleton } from '@package/ui-native';

export function SkeletonDemo() {
  return (
    <View className='flex-row items-center gap-4'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <View className='flex-1 gap-2'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </View>
    </View>
  );
}

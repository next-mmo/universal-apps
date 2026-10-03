import { Skeleton } from '@package/ui/skeleton';

/** Live skeleton demo shared by the Skeleton docs page and the framework preview. */
export function SkeletonDemo() {
  return (
    <div className='flex max-w-sm items-center gap-4'>
      <Skeleton className='size-12 rounded-full' />
      <div className='grid flex-1 gap-2'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    </div>
  );
}

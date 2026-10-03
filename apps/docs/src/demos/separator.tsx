import { Separator } from '@package/ui/separator';

/** Live separator demo shared by the Separator docs page and the framework preview. */
export function SeparatorDemo() {
  return (
    <div className='max-w-sm'>
      <p className='text-sm'>Content above the divider.</p>
      <Separator className='my-4' />
      <p className='text-sm'>Content below the divider.</p>
    </div>
  );
}

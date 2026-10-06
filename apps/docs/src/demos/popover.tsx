import { Button } from '@package/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@package/ui/popover';

/** Live popover demo shared by the Popover docs page and the framework preview. */
export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 text-sm'>
        <p className='font-medium'>Popover title</p>
        <p className='text-muted-foreground'>Any content can live here — forms, filters, hints.</p>
      </PopoverContent>
    </Popover>
  );
}

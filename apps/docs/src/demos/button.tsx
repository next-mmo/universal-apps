import { Button } from '@package/ui/button';
import { PlusIcon } from 'lucide-react';

const row = 'flex flex-wrap items-center gap-3';

/** Live button demo shared by the Button docs page and the framework preview. */
export function ButtonDemo() {
  return (
    <div className='flex flex-col gap-3'>
      <div className={row}>
        <Button>Default</Button>
        <Button variant='secondary'>Secondary</Button>
        <Button variant='destructive'>Destructive</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='link'>Link</Button>
      </div>
      <div className={row}>
        <Button size='sm' variant='secondary'>Small</Button>
        <Button variant='secondary'>Default</Button>
        <Button size='lg' variant='secondary'>Large</Button>
        <Button size='icon' variant='outline' aria-label='Add'><PlusIcon /></Button>
      </div>
    </div>
  );
}

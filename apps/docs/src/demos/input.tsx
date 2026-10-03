import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';

/** Live input demo shared by the Input docs page and the framework preview. */
export function InputDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-task-input'>Task</Label>
      <Input id='demo-task-input' placeholder='What needs doing?' />
    </div>
  );
}

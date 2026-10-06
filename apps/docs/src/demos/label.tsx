import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';

/** Live label demo shared by the Label docs page and the framework preview. */
export function LabelDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-label-priority'>Priority</Label>
      <Input id='demo-label-priority' defaultValue='Normal' />
    </div>
  );
}

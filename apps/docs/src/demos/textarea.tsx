import { Label } from '@package/ui/label';
import { Textarea } from '@package/ui/textarea';

/** Live textarea demo shared by the Textarea docs page and the framework preview. */
export function TextareaDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-notes'>Notes</Label>
      <Textarea id='demo-notes' placeholder='Optional details…' rows={3} />
    </div>
  );
}

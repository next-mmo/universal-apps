import { Checkbox } from '@package/ui/checkbox';
import { Label } from '@package/ui/label';

const row = 'flex flex-wrap items-center gap-3';

/** Live checkbox demo shared by the Checkbox docs page and the framework preview. */
export function CheckboxDemo() {
  return (
    <div className={row}>
      <Checkbox id='demo-pin' defaultChecked />
      <Label htmlFor='demo-pin'>Pin to top</Label>
      <Checkbox id='demo-disabled' disabled />
      <Label htmlFor='demo-disabled' className='text-muted-foreground'>Disabled</Label>
    </div>
  );
}

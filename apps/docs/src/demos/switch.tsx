import { Label } from '@package/ui/label';
import { Switch } from '@package/ui/switch';

const row = 'flex flex-wrap items-center gap-3';

/** Live switch demo shared by the Switch docs page and the framework preview. */
export function SwitchDemo() {
  return (
    <div className={row}>
      <Switch id='demo-pin-switch' defaultChecked />
      <Label htmlFor='demo-pin-switch'>Surface this task at the top</Label>
    </div>
  );
}

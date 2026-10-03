import { Badge } from '@package/ui/badge';

const row = 'flex flex-wrap items-center gap-3';

/** Live badge demo shared by the Badge docs page and the framework preview. */
export function BadgeDemo() {
  return (
    <div className={row}>
      <Badge>Default</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='destructive'>Destructive</Badge>
      <Badge variant='outline'>Outline</Badge>
    </div>
  );
}

import { Button } from '@package/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@package/ui/tooltip';
import { InfoIcon } from 'lucide-react';

const row = 'flex flex-wrap items-center gap-3';

/** Live tooltip demo shared by the Tooltip docs page and the framework preview. */
export function TooltipDemo() {
  return (
    <div className={row}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='ghost' size='icon' aria-label='Info'><InfoIcon /></Button>
        </TooltipTrigger>
        <TooltipContent>More information</TooltipContent>
      </Tooltip>
      <span className='text-muted-foreground text-sm'>Hover the icon button.</span>
    </div>
  );
}

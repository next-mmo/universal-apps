import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '../../lib/cn';

import type { ComponentProps } from 'react';

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'peer inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] shadow-inner transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-green data-[state=unchecked]:bg-fill',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'pointer-events-none block size-[27px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/cn';

import type { ComponentProps } from 'react';

function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot='slider'
      className={cn('relative flex w-full touch-none items-center select-none', className)}
      {...props}
    >
      <SliderPrimitive.Track className='bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full'>
        <SliderPrimitive.Range className='bg-primary absolute h-full' />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className='border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden' />
    </SliderPrimitive.Root>
  );
}

export { Slider };

import { cn } from '@/lib/cn';

import type { ComponentProps } from 'react';

/**
 * Base placeholder — the CLI falls back to this template when no
 * `<name>.tsx` template exists. Paste the canonical shadcn/ui source here.
 */
export function BaseTemplate({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot='base-template' className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

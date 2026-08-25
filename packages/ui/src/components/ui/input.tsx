import { cn } from '../../lib/cn';

import type { ComponentProps } from 'react';

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'flex h-9 w-full min-w-0 rounded-[10px] border border-input bg-fill px-3 py-1 text-base shadow-none transition-[color,border-color,background-color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-fill',
        'focus-visible:border-primary/60 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/30',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };

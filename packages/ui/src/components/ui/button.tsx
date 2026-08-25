import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

import type { ComponentProps } from 'react';

/**
 * Apple-style control variants: `primary` is a tinted fill (like iOS
 * filled buttons), `secondary` a neutral gray fill, `ghost` a plain text
 * control, `destructive` the system red.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] text-sm font-medium tracking-[-0.01em] transition-all duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:brightness-110',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:brightness-110',
        outline:
          'border border-border bg-card text-card-foreground shadow-xs hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:brightness-[0.97] dark:hover:brightness-125',
        ghost: 'text-primary hover:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 has-[>svg]:px-3.5',
        sm: 'h-8 gap-1 px-3 text-[13px] has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-5',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

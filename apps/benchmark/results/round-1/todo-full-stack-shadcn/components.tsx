import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

/**
 * Vendored shadcn-style primitives.
 *
 * Deliberately dependency-free: no `clsx`, no `cva`, no `cn` helper. Each
 * primitive is a thin wrapper that keeps an accessible element underneath,
 * accepts a className pass-through, and merges it with its own defaults so
 * callers can override styling without a class-merging library.
 */

const join = (...values: Array<string | undefined>) => values.filter(Boolean).join(' ');

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'icon';

const buttonVariants: Record<ButtonVariant, string> = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
};

const buttonSizes: Record<ButtonSize, string> = {
  default: 'h-9 px-4',
  sm: 'h-8 px-3 text-sm',
  icon: 'size-8',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'default', size = 'default', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={join(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
        'disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={join(
        'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900',
        'placeholder:text-slate-400 focus:border-slate-500 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

type BadgeVariant = 'default' | 'secondary' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-900 text-white',
  secondary: 'bg-slate-100 text-slate-700',
  outline: 'border border-slate-300 text-slate-700',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={join(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={join('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    />
  );
}

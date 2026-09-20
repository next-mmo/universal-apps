import { cva } from 'class-variance-authority';
import { createContext, useContext, useState } from 'react';

import { cn } from '../../lib/cn';

import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden bg-muted select-none items-center justify-center font-medium',
  {
    variants: {
      size: {
        sm: 'size-8 text-xs',
        default: 'size-10 text-sm',
        lg: 'size-12 text-base',
        xl: 'size-16 text-lg font-semibold',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'default',
      shape: 'circle',
    },
  },
);

type AvatarContextValue = {
  hasImageLoaded: boolean;
  setHasImageLoaded: (loaded: boolean) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export interface AvatarProps
  extends ComponentProps<'div'>,
    VariantProps<typeof avatarVariants> {}

export function Avatar({
  className,
  size,
  shape,
  children,
  ...props
}: AvatarProps) {
  const [hasImageLoaded, setHasImageLoaded] = useState(false);

  return (
    <AvatarContext.Provider value={{ hasImageLoaded, setHasImageLoaded }}>
      <div
        data-slot='avatar'
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export interface AvatarImageProps extends ComponentProps<'img'> {
  src?: string;
  alt?: string;
}

export function AvatarImage({
  className,
  src,
  alt = '',
  onError,
  onLoad,
  ...props
}: AvatarImageProps) {
  const ctx = useContext(AvatarContext);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null;

  return (
    <img
      data-slot='avatar-image'
      src={src}
      alt={alt}
      className={cn('aspect-square size-full object-cover', className)}
      onLoad={(e) => {
        ctx?.setHasImageLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setHasError(true);
        ctx?.setHasImageLoaded(false);
        onError?.(e);
      }}
      {...props}
    />
  );
}

export interface AvatarFallbackProps extends ComponentProps<'span'> {
  delayMs?: number;
}

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  const ctx = useContext(AvatarContext);

  if (ctx?.hasImageLoaded) return null;

  return (
    <span
      data-slot='avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-[inherit] font-medium text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

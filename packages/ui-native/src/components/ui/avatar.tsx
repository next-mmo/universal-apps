import { createContext, useContext, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { ImageSourcePropType, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'square';

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'size-8', text: 'text-xs' },
  default: { container: 'size-10', text: 'text-sm' },
  lg: { container: 'size-12', text: 'text-base' },
  xl: { container: 'size-16', text: 'text-lg font-semibold' },
};

const shapeMap: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-xl',
};

export const avatarVariants = {
  size: sizeMap,
  shape: shapeMap,
};
export type { AvatarSize, AvatarShape };

type AvatarContextValue = {
  hasImageLoaded: boolean;
  setHasImageLoaded: (loaded: boolean) => void;
  size: AvatarSize;
  shape: AvatarShape;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export interface AvatarProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Avatar({
  size = 'default',
  shape = 'circle',
  className,
  style,
  children,
  ...props
}: AvatarProps) {
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  const sizeStyle = sizeMap[size] ?? sizeMap.default;
  const shapeStyle = shapeMap[shape] ?? shapeMap.circle;

  return (
    <AvatarContext.Provider value={{ hasImageLoaded, setHasImageLoaded, size, shape }}>
      <View
        className={cn(
          'relative flex shrink-0 overflow-hidden items-center justify-center bg-muted',
          sizeStyle.container,
          shapeStyle,
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
}

export interface AvatarImageProps {
  source?: ImageSourcePropType | { uri: string };
  alt?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
  onLoad?: () => void;
  onError?: () => void;
}

export function AvatarImage({
  source,
  className,
  style,
  onLoad,
  onError,
  ...props
}: AvatarImageProps) {
  const ctx = useContext(AvatarContext);
  const [hasError, setHasError] = useState(false);

  if (!source || hasError) return null;

  return (
    <Image
      source={source}
      className={cn('size-full', className)}
      style={style}
      onLoad={() => {
        ctx?.setHasImageLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        setHasError(true);
        ctx?.setHasImageLoaded(false);
        onError?.();
      }}
      {...props}
    />
  );
}

export interface AvatarFallbackProps {
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
}

export function AvatarFallback({
  className,
  textClassName,
  style,
  textStyle,
  children,
  ...props
}: AvatarFallbackProps) {
  const ctx = useContext(AvatarContext);
  if (ctx?.hasImageLoaded) return null;

  const currentSize = ctx?.size ?? 'default';
  const sizeStyle = sizeMap[currentSize] ?? sizeMap.default;

  return (
    <View
      className={cn('flex size-full items-center justify-center bg-muted', className)}
      style={style}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn('font-medium text-muted-foreground', sizeStyle.text, textClassName)}
          style={textStyle}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

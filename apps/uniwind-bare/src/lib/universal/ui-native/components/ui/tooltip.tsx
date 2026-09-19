import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

interface TooltipRootProps {
  /** Text shown in the bubble while the trigger is pressed. */
  content: ReactNode;
  /** The trigger element; any pressable child works. */
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * RN port of the Radix Tooltip as a single component: DOM usage
 * `<Tooltip><TooltipTrigger/><TooltipContent/></Tooltip>` maps to
 * `<Tooltip content='...'>{trigger}</Tooltip>`, since RN has no portal and
 * the bubble must render inside the same layout node.
 */
export function Tooltip({ content, children, className, style }: TooltipRootProps) {
  const [open, setOpen] = useState(false);
  return (
    <View className={className} style={style}>
      <Pressable
        accessibilityLabel={typeof content === 'string' ? content : undefined}
        onPressIn={() => setOpen(true)}
        onPressOut={() => setOpen(false)}
      >
        {children}
      </Pressable>
      {open ? (
        <View className='absolute top-full left-0 z-50 mt-1 self-start rounded-md bg-primary px-3 py-1.5'>
          <Text className='font-sans text-xs text-primary-foreground'>{content}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** API-parity aliases so DOM JSX trees port with minimal edits. */
export const TooltipTrigger = ({ children }: { children: ReactNode }) => <View>{children}</View>;
export const TooltipContent = ({ children }: { children: ReactNode }) => <View>{children}</View>;
export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

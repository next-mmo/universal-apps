import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** API-parity aliases so DOM JSX trees port with minimal edits. */
export const TooltipTrigger = ({ children }: { children: ReactNode }) => <View>{children}</View>;
export const TooltipContent = ({ children }: { children: ReactNode }) => <View>{children}</View>;
export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export interface TooltipRootProps {
  /** Text shown in the bubble while the trigger is pressed. */
  content?: ReactNode;
  /** The trigger element or compound children (<TooltipTrigger/>, <TooltipContent/>); any pressable child works. */
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * RN port of the Radix Tooltip: supports both single-component shorthand
 * `<Tooltip content='...'>{trigger}</Tooltip>` and DOM compound usage
 * `<Tooltip><TooltipTrigger/><TooltipContent/></Tooltip>`.
 */
export function Tooltip({ content, children, className, style }: TooltipRootProps) {
  const [open, setOpen] = useState(false);

  let triggerNode: ReactNode = children;
  let contentNode: ReactNode = content;

  const extract = (nodes: ReactNode) => {
    const flat = Array.isArray(nodes) ? nodes : [nodes];
    for (const node of flat) {
      if (!node || typeof node !== 'object' || !('type' in node)) {
        continue;
      }
      const el = node as { type?: unknown; props?: Record<string, unknown> };
      if (el.type === TooltipTrigger && el.props) {
        triggerNode = el.props.children as ReactNode;
      } else if (el.type === TooltipContent && el.props) {
        contentNode = el.props.children as ReactNode;
      }
    }
  };
  extract(children);

  return (
    <View className={className} style={style}>
      <Pressable
        accessibilityLabel={typeof contentNode === 'string' ? contentNode : undefined}
        onPressIn={() => setOpen(true)}
        onPressOut={() => setOpen(false)}
      >
        {triggerNode}
      </Pressable>
      {open ? (
        <View className='absolute top-full left-0 z-50 mt-1 self-start rounded-md bg-primary px-3 py-1.5'>
          {typeof contentNode === 'string' ? (
            <Text className='font-sans text-xs text-primary-foreground'>{contentNode}</Text>
          ) : (
            contentNode
          )}
        </View>
      ) : null}
    </View>
  );
}

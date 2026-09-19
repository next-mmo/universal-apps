import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** API-parity aliases so DOM JSX trees port with minimal edits. */
export const PopoverTrigger = ({ children }: { children: ReactNode }) => <View>{children}</View>;
export const PopoverContent = ({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) => (
  <View className={className} style={style}>
    {children}
  </View>
);
export const PopoverAnchor = ({ children }: { children: ReactNode }) => <View>{children}</View>;

/**
 * RN port of the Radix Popover: a trigger opening a centered panel with
 * arbitrary content; close on backdrop press like the DOM dismiss behavior.
 * Supports both `trigger` prop and `<PopoverTrigger>` / `<PopoverContent>` children.
 */
export function Popover({
  trigger,
  children,
}: {
  trigger?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  let triggerNode: ReactNode = trigger;
  const contentNodes: ReactNode[] = [];

  const extract = (nodes: ReactNode) => {
    const flat = Array.isArray(nodes) ? nodes : [nodes];
    for (const node of flat) {
      if (!node || typeof node !== 'object' || !('type' in node)) {
        contentNodes.push(node);
        continue;
      }
      const el = node as { type?: unknown; props?: Record<string, unknown> };
      if (el.type === PopoverTrigger && el.props) {
        triggerNode = el.props.children as ReactNode;
      } else if (el.type === PopoverContent && el.props) {
        contentNodes.push(el.props.children as ReactNode);
      } else {
        contentNodes.push(node);
      }
    }
  };
  extract(children);

  return (
    <View>
      <Pressable onPress={() => setOpen(true)} accessibilityRole='button'>
        {triggerNode}
      </Pressable>
      <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
        <Pressable className='flex-1 justify-center bg-black/25 px-4' onPress={close}>
          <View
            className='w-full rounded-xl border border-border bg-popover p-4'
            onStartShouldSetResponder={() => true}
          >
            {contentNodes.length > 0 ? contentNodes : children}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * RN port of the Radix Popover: a trigger opening a centered panel with
 * arbitrary content; close on backdrop press like the DOM dismiss behavior.
 */
export function Popover({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(true)} accessibilityRole='button'>
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
        <Pressable className='flex-1 justify-center bg-black/25 px-4' onPress={close}>
          <View
            className='w-full rounded-xl border border-border bg-popover p-4'
            onStartShouldSetResponder={() => true}
          >
            {children}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

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

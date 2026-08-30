import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';

/**
 * RN port of the Radix DropdownMenu: a trigger that opens a centered
 * action sheet; menus stay simple (items, labels, separators, checkbox
 * items) with DOM-parity names.
 */
export function DropdownMenu({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const walk = (nodes: ReactNode): ReactNode[] => {
    const out: ReactNode[] = [];
    const flat = Array.isArray(nodes) ? nodes : [nodes];
    for (const node of flat) {
      if (!node || typeof node !== 'object' || !('type' in node)) continue;
      const el = node as { type?: unknown; props?: Record<string, unknown> };
      if (el.type === DropdownMenuItem || el.type === DropdownMenuLabel || el.type === DropdownMenuCheckboxItem || el.type === DropdownMenuSeparator) {
        out.push(node);
      }
    }
    return out;
  };

  return (
    <View>
      <Pressable onPress={() => setOpen(true)} accessibilityRole='button'>
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
        <Pressable className='flex-1 justify-center bg-black/25 px-4' onPress={close}>
          <View className='w-full overflow-hidden rounded-xl border border-border bg-popover p-1' onStartShouldSetResponder={() => true}>
            {walk(children)}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function DropdownMenuItemInner({
  destructive,
  onSelect,
  children,
}: {
  destructive?: boolean;
  onSelect?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole='menuitem'
      onPress={onSelect}
      className='flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:opacity-80'
    >
      <Text className={cn('font-sans text-sm', destructive ? 'text-destructive' : 'text-popover-foreground')}>
        {children}
      </Text>
    </Pressable>
  );
}

export function DropdownMenuItem({
  variant = 'default',
  onSelect,
  children,
}: {
  variant?: 'default' | 'destructive';
  onSelect?: () => void;
  children?: ReactNode;
}) {
  return (
    <DropdownMenuItemInner destructive={variant === 'destructive'} onSelect={onSelect}>
      {children}
    </DropdownMenuItemInner>
  );
}

export function DropdownMenuLabel({ children }: { children?: ReactNode }) {
  return (
    <Text className='px-2 py-1.5 font-sans text-sm font-medium text-foreground'>{children}</Text>
  );
}

export function DropdownMenuSeparator() {
  return <View className='-mx-1 my-1 h-px bg-border' />;
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole='menuitem'
      accessibilityState={{ checked: !!checked }}
      onPress={() => onCheckedChange?.(!checked)}
      className='flex-row items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 active:opacity-80'
    >
      <Text className='absolute left-2 font-sans text-sm text-foreground'>{checked ? '✓' : ''}</Text>
      <Text className='font-sans text-sm text-popover-foreground'>{children}</Text>
    </Pressable>
  );
}

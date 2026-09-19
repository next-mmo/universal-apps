import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/src/lib/cn';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * RN port of the Radix Select: a trigger button opening a centered sheet
 * with the item list; controlled via `value`/`onValueChange` like the DOM
 * Select.Root + Select.Item contract.
 */
export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const select = (v: string) => {
    onValueChange?.(v);
    setOpen(false);
  };

  // Children are split into trigger label vs items by walking the tree:
  // SelectValue carries the placeholder/label, SelectItem entries render
  // into the sheet.
  let label: ReactNode = value;
  const items: { value: string; label: ReactNode }[] = [];

  const walk = (nodes: ReactNode) => {
    const flat: ReactNode[] = Array.isArray(nodes) ? nodes : [nodes];
    for (const node of flat) {
      if (!node || typeof node !== 'object' || !('type' in node)) continue;
      const el = node as { type?: unknown; props?: Record<string, unknown>; propsChildren?: unknown };
      if (el.type === SelectValue && el.props) {
        label = (el.props.children as ReactNode) ?? (el.props.placeholder as ReactNode) ?? value;
      } else if (el.type === SelectItem && el.props) {
        const itemValue = el.props.value as string | undefined;
        if (itemValue !== undefined) {
          items.push({
            value: itemValue,
            label: (el.props.children as ReactNode) ?? itemValue,
          });
        }
      } else if (
        (el.type === SelectContent || el.type === SelectGroup || el.type === SelectTrigger) &&
        el.props
      ) {
        walk(el.props.children as ReactNode);
      }
    }
  };
  walk(children);

  return (
    <View>
      <Pressable
        accessibilityRole='combobox'
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        className={cn(
          'h-9 flex-row items-center justify-between gap-2 self-start rounded-[10px] border border-input bg-transparent px-3 active:opacity-80',
        )}
      >
        <Text className='font-sans text-sm text-foreground'>{label}</Text>
        <Text className='font-sans text-sm text-muted-foreground'>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType='fade' onRequestClose={close} statusBarTranslucent>
        <Pressable className='flex-1 justify-center bg-black/25 px-4' onPress={close}>
          <View className='max-h-80 w-full overflow-hidden rounded-xl border border-border bg-popover p-1' onStartShouldSetResponder={() => true}>
            {items.map((item) => (
              <Pressable
                key={item.value}
                accessibilityRole='menuitem'
                onPress={() => select(item.value)}
                className={cn(
                  'flex-row items-center justify-between rounded-sm px-2 py-1.5 active:opacity-80',
                  item.value === value ? 'bg-accent' : '',
                )}
              >
                <Text className='font-sans text-sm text-popover-foreground'>{item.label}</Text>
                {item.value === value ? <Text className='text-sm text-foreground'>✓</Text> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Marker components so DOM JSX trees port without rewrites. */
export const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: ReactNode }) => <>{children ?? placeholder}</>;
// `value` is read by the parent Select via child props walking, not here.
export const SelectItem = ({ children }: { value?: string; children?: ReactNode }) => <>{children}</>;
export const SelectGroup = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const SelectLabel = ({ children }: { children?: ReactNode }) => <Text className='px-2 py-1.5 font-sans text-xs text-muted-foreground'>{children}</Text>;
export const SelectContent = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const SelectSeparator = () => <View className='-mx-1 my-1 h-px bg-border' />;

/** Composed trigger with explicit label or children, for non-marker usage. */
export function SelectTrigger({
  label,
  className,
  style,
  children,
  ...props
}: {
  label?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View
      accessibilityRole='button'
      className={cn(
        'h-9 flex-row items-center justify-between gap-2 self-start rounded-[10px] border border-input bg-transparent px-3',
        className,
      )}
      style={style}
      {...props}
    >
      {children ?? (
        <>
          <Text className='font-sans text-sm text-foreground'>{label}</Text>
          <Text className='font-sans text-sm text-muted-foreground'>⌄</Text>
        </>
      )}
    </View>
  );
}

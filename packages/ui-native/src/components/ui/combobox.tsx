import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { cn } from '@package/ui/cn';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

import type { StyleProp, ViewStyle } from 'react-native';

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  emptyText = 'No option found.',
  className,
  style,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((opt) => opt.value === value);

  const filtered = useMemo(() => {
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable
        accessibilityRole='combobox'
        accessibilityState={{ expanded: open, disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          'h-10 w-full flex-row items-center justify-between rounded-xl border border-input bg-card px-3 active:opacity-80',
          disabled && 'opacity-40',
          className,
        )}
        style={style}
      >
        <Text
          className={cn(
            'font-sans text-sm',
            selected ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text className='font-sans text-xs text-muted-foreground'>⌄</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType='fade'
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable className='flex-1 justify-center bg-black/35 px-4' onPress={close}>
          <View
            className='max-h-[75%] w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl'
            onStartShouldSetResponder={() => true}
          >
            <Command>
              <CommandInput
                placeholder={searchPlaceholder}
                value={query}
                onChangeText={setQuery}
              />
              <CommandList>
                {filtered.length === 0 ? (
                  <CommandEmpty>{emptyText}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filtered.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          onValueChange?.(opt.value === value ? '' : opt.value);
                          close();
                        }}
                      >
                        <Text className='font-sans text-sm text-foreground'>{opt.label}</Text>
                        {value === opt.value && (
                          <Text className='font-sans text-sm font-bold text-primary'>✓</Text>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>

            <View className='border-t border-border p-2'>
              <Pressable
                accessibilityRole='button'
                onPress={close}
                className='items-center rounded-xl bg-secondary py-2 active:opacity-80'
              >
                <Text className='font-sans text-xs font-semibold text-secondary-foreground'>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

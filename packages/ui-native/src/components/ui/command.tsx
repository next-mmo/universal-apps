import { createContext, useContext, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { cn } from '@package/ui/cn';

import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface CommandContextValue {
  search: string;
  setSearch: (search: string) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommand() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('Command components must be used within <Command>');
  return ctx;
}

export function Command({
  className,
  style,
  children,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const [search, setSearch] = useState('');

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <View
        className={cn(
          'w-full overflow-hidden rounded-2xl border border-border bg-popover text-foreground shadow-lg',
          className,
        )}
        style={style}
      >
        {children}
      </View>
    </CommandContext.Provider>
  );
}

export function CommandInput({
  placeholder = 'Type a command or search...',
  className,
  style,
  value,
  onChangeText,
}: {
  placeholder?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  const { search, setSearch } = useCommand();
  const current = value !== undefined ? value : search;

  return (
    <View className='border-b border-border px-3 py-2'>
      <TextInput
        value={current}
        onChangeText={(text) => {
          if (value === undefined) setSearch(text);
          onChangeText?.(text);
        }}
        placeholder={placeholder}
        placeholderTextColor='#98989d'
        className={cn('h-10 text-sm text-foreground', className)}
        style={style}
      />
    </View>
  );
}

export function CommandList({
  className,
  style,
  children,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <ScrollView
      className={cn('max-h-72 p-1', className)}
      style={style}
      keyboardShouldPersistTaps='handled'
    >
      {children}
    </ScrollView>
  );
}

export function CommandEmpty({
  children = 'No results found.',
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <View className='py-6 items-center justify-center'>
      <Text className={cn('font-sans text-sm text-muted-foreground', className)} style={style}>
        {children}
      </Text>
    </View>
  );
}

export function CommandGroup({
  heading,
  children,
  className,
  style,
}: {
  heading?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View className={cn('p-1', className)} style={style}>
      {heading && (
        <Text className='px-2 py-1.5 font-sans text-xs font-semibold text-muted-foreground'>
          {heading}
        </Text>
      )}
      {children}
    </View>
  );
}

export function CommandSeparator({
  className,
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return <View className={cn('my-1 h-px bg-border', className)} style={style} />;
}

export function CommandItem({
  onSelect,
  disabled,
  children,
  className,
  style,
}: {
  onSelect?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      disabled={disabled}
      onPress={() => {
        if (!disabled) onSelect?.();
      }}
      className={cn(
        'flex-row items-center justify-between rounded-xl px-3 py-2.5 active:bg-accent',
        disabled && 'opacity-50',
        className,
      )}
      style={style}
    >
      {typeof children === 'string' ? (
        <Text className='font-sans text-sm text-foreground'>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function CommandShortcut({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text className={cn('font-sans text-xs text-muted-foreground tracking-widest', className)} style={style}>
      {children}
    </Text>
  );
}

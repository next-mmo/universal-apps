import { SearchIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';

interface CommandContextValue {
  search: string;
  setSearch: (search: string) => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error('Command components must be used within <Command>');
  return ctx;
}

export function Command({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const [search, setSearch] = React.useState('');

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        data-slot='command'
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export function CommandInput({
  className,
  placeholder = 'Type a command or search...',
  ...props
}: React.ComponentProps<'input'>) {
  const { search, setSearch } = useCommand();

  return (
    <div className='flex items-center border-b border-border px-3'>
      <SearchIcon className='mr-2 size-4 shrink-0 opacity-50' />
      <input
        data-slot='command-input'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-list'
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  className,
  children = 'No results found.',
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-empty'
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandGroup({
  className,
  heading,
  children,
  ...props
}: React.ComponentProps<'div'> & { heading?: React.ReactNode }) {
  return (
    <div data-slot='command-group' className={cn('overflow-hidden p-1 text-foreground', className)} {...props}>
      {heading && (
        <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-separator'
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

export function CommandItem({
  className,
  onSelect,
  disabled,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSelect'> & {
  onSelect?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      data-slot='command-item'
      role='option'
      aria-selected={false}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onSelect?.();
      }}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='command-shortcut'
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
}

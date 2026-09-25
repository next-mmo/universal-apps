import { SearchIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '../../ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/components/ui/dropdown-menu';
import { Input } from '../../ui/components/ui/input';

import type { ReactNode } from 'react';
import type { ProColumnDef } from '../../pro-core/table/columns';

interface DataTableToolbarProps<T> {
  columns: Array<ProColumnDef<T>>;
  /** Currently visible column ids (TanStack state). */
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  extra?: ReactNode;
}

/** Search box + column toggle + refresh; page-level buttons go in `extra`. */
export function DataTableToolbar<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  onRefresh,
  extra,
}: DataTableToolbarProps<T>) {
  const toggleable = columns.filter((column) => column.valueType !== 'actions');

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='relative w-full max-w-xs sm:w-64'>
        <SearchIcon className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className='pl-8'
          aria-label='Search table'
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm'>
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-44'>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {toggleable.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={columnVisibility[column.key] !== false}
              onCheckedChange={(checked) =>
                onColumnVisibilityChange({ ...columnVisibility, [column.key]: !!checked })
              }
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {onRefresh !== undefined && (
        <Button variant='outline' size='sm' onClick={onRefresh} aria-label='Refresh data'>
          <RefreshCwIcon />
          Refresh
        </Button>
      )}

      <div className='ml-auto flex items-center gap-2'>{extra}</div>
    </div>
  );
}

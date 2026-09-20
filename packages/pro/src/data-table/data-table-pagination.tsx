import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@package/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/select';

import { defaultTableFeatures } from '@package/pro-core/table-features';

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  selectedCount: number;
  /** Choices offered in the size selector; defaults to the shared table defaults. */
  pageSizeOptions?: number[];
  onPageSizeChange: (size: number) => void;
  onPageIndexChange: (index: number) => void;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  selectedCount,
  pageSizeOptions = defaultTableFeatures.pageSizeOptions,
  onPageSizeChange,
  onPageIndexChange,
}: DataTablePaginationProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 px-1'>
      <p className='text-sm text-muted-foreground'>
        {selectedCount > 0 && (
          <span className='mr-3 font-medium text-foreground'>{selectedCount} selected</span>
        )}
        {totalRows} row{totalRows === 1 ? '' : 's'}
      </p>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='hidden text-sm text-muted-foreground sm:inline'>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger size='sm' aria-label='Rows per page'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className='text-sm text-muted-foreground'>
          Page {Math.min(pageIndex + 1, Math.max(pageCount, 1))} of {Math.max(pageCount, 1)}
        </span>

        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            disabled={pageIndex === 0}
            onClick={() => onPageIndexChange(pageIndex - 1)}
            aria-label='Previous page'
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            disabled={pageIndex >= pageCount - 1}
            onClick={() => onPageIndexChange(pageIndex + 1)}
            aria-label='Next page'
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

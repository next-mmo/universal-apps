import { flexRender } from '@tanstack/react-table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import { buildColumnDefs } from './columns';
import { proTableFeatures } from './pro-table-features';
import { Button } from '@package/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@package/ui/table';
import { Skeleton } from '@package/ui/skeleton';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { ProColumnDef } from '@package/pro-core/table';
import type {
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';
import type { TableFeatures, TableQuery } from '@package/pro-core/table-features';
import { useTable } from '@tanstack/react-table';

export interface ProDataTableProps<T> {
  columns: Array<ProColumnDef<T>>;
  data: T[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  features?: TableFeatures;
  getRowId?: (row: T) => string;

  /**
   * Server mode: pass the current query state and total row count, plus
   * onQueryChange. Without them the table manages everything client-side.
   */
  query?: TableQuery;
  totalRows?: number;
  onQueryChange?: (query: TableQuery) => void;

  searchPlaceholder?: string;
  toolbarExtra?: ReactNode;
  empty?: ReactNode;
  onRefresh?: () => void;
}

export function ProDataTable<T extends RowData>({
  columns,
  data,
  loading = false,
  error,
  onRetry,
  features = {},
  getRowId,
  query,
  totalRows,
  onQueryChange,
  searchPlaceholder,
  toolbarExtra,
  empty,
  onRefresh,
}: ProDataTableProps<T>) {
  const serverMode = query !== undefined && onQueryChange !== undefined;
  const enableRowSelection = features.rowSelection === true;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: features.pageSizeOptions?.[0] ?? 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() =>
    Object.fromEntries(
      columns.filter((c) => c.hiddenByDefault === true).map((c) => [c.key, false]),
    ),
  );

  const effectiveSearch = serverMode ? (query.search ?? '') : globalFilter;
  const effectivePageSize = serverMode ? (query.pageSize ?? 10) : pagination.pageSize;

  function handleSearchChange(value: string) {
    if (serverMode) {
      onQueryChange({ ...query!, page: 0, search: value || undefined });
    } else {
      setGlobalFilter(value);
    }
  }

  function handlePageSizeChange(size: number) {
    if (serverMode) {
      onQueryChange({ ...query!, page: 0, pageSize: size });
    } else {
      setPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
    }
  }

  const table = useTable({
    features: proTableFeatures,
    data,
    columns: buildColumnDefs(columns, { enableRowSelection }),
    getRowId: getRowId !== undefined ? (row) => getRowId(row as T) : undefined,
    state: {
      sorting: serverMode ? [] : sorting,
      globalFilter: serverMode ? '' : globalFilter,
      pagination: serverMode ? { pageIndex: query!.page, pageSize: query!.pageSize } : pagination,
      rowSelection,
      columnVisibility,
    },
    manualSorting: serverMode,
    manualFiltering: serverMode,
    manualPagination: serverMode,
    rowCount: serverMode ? totalRows : undefined,
    enableRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      const first = next[0];
      onQueryChange?.({
        ...query!,
        page: 0,
        sortBy: first?.id ?? undefined,
        sortDir: first ? (first.desc ? 'desc' : 'asc') : undefined,
      });
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
      if (serverMode) {
        onQueryChange({ ...query!, page: next.pageIndex, pageSize: next.pageSize });
      }
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: 'includesString',
  });

  const rows = table.getRowModel().rows;
  const resolvedTotal = serverMode ? (totalRows ?? 0) : table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(Math.ceil(resolvedTotal / effectivePageSize), 1);

  return (
    <div className='flex w-full flex-col gap-4'>
      <DataTableToolbar
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        search={effectiveSearch}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        onRefresh={features.refresh === false ? undefined : onRefresh}
        extra={toolbarExtra}
      />

      <div className='overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type='button'
                        className='-ml-2 inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 font-medium hover:bg-accent'
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className='text-[10px] text-muted-foreground'>
                          {{ asc: '▲', desc: '▼' }[header.column.getIsSorted() as string] ?? ''}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {error !== undefined && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='h-32 text-center'>
                  <p className='text-sm font-medium text-destructive'>
                    Failed to load data: {error instanceof Error ? error.message : String(error)}
                  </p>
                  {onRetry !== undefined && (
                    <Button variant='outline' size='sm' className='mt-2' onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}

            {error === undefined && loading && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='p-4'>
                  <div className='flex flex-col gap-3'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className='h-6 w-full' />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {error === undefined && !loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                  {empty ?? 'No results.'}
                </TableCell>
              </TableRow>
            )}

            {error === undefined &&
              !loading &&
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {(features.pagination ?? true) && (
        <DataTablePagination
          pageIndex={serverMode ? query!.page : pagination.pageIndex}
          pageSize={effectivePageSize}
          pageCount={pageCount}
          totalRows={resolvedTotal}
          selectedCount={table.getSelectedRowModel().rows.length}
          onPageSizeChange={handlePageSizeChange}
          onPageIndexChange={(index) => {
            if (serverMode) onQueryChange!({ ...query!, page: index });
            else setPagination((prev) => ({ ...prev, pageIndex: index }));
          }}
        />
      )}
    </div>
  );
}

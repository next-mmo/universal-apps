import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * The v9 feature set for every ProDataTable instance: sorting, global
 * filtering, pagination, row selection, and column visibility, with the
 * client-side row models. In server mode the `manual*` flags make these
 * pass-through, so the same feature object serves both modes.
 *
 * The `sortFns`/`filterFns` registries define the string keys allowed in
 * column defs (`sortFn: 'basic' | 'alphanumeric' | 'datetime'`) and in
 * `globalFilterFn: 'includesString'`.
 */
export const proTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    basic: sortFn_basic,
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
  },
});

export type ProTableFeatures = typeof proTableFeatures;

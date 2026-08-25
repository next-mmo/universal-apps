<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';

import type { ActionColumnDef, ProColumnDef } from '@package/pro-core/src/table/columns';
import type {
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table';
import type { TableFeatures, TableQuery } from '@package/pro-core/src/table/features';

const props = withDefaults(
  defineProps<{
    columns: Array<ProColumnDef<Record<string, unknown>>>;
    data: Array<Record<string, unknown>>;
    loading?: boolean;
    error?: unknown;
    features?: TableFeatures;
    query?: TableQuery;
    totalRows?: number;
    onQueryChange?: (query: TableQuery) => void;
    searchPlaceholder?: string;
  }>(),
  { loading: false, error: undefined, searchPlaceholder: 'Search…' },
);

const serverMode = computed(() => props.query !== undefined && props.onQueryChange !== undefined);
const pageSizeOptions = computed(() => props.features?.pageSizeOptions ?? [10, 20, 50]);

const sorting = ref<SortingState>([]);
const globalFilter = ref('');
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: pageSizeOptions.value[0] });
const rowSelection = ref<Record<string, boolean>>({});
const columnVisibility = ref<VisibilityState>(() =>
  Object.fromEntries(props.columns.filter((c) => c.hiddenByDefault).map((c) => [c.key, false])),
);
watch(
  () => props.columns,
  (cols) => {
    columnVisibility.value = Object.fromEntries(
      cols.filter((c) => c.hiddenByDefault).map((c) => [c.key, false]),
    );
  },
);

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns: props.columns.map((column) => ({
    id: column.key,
    accessorFn: (row: Record<string, unknown>) => row[(column as { accessor?: string }).accessor ?? column.key],
    enableSorting: !('actions' in column),
  })),
  state: {
    get sorting() {
      return serverMode.value ? [] : sorting.value;
    },
    get globalFilter() {
      return serverMode.value ? '' : globalFilter.value;
    },
    get pagination() {
      return serverMode.value
        ? { pageIndex: props.query!.page, pageSize: props.query!.pageSize }
        : pagination.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
  },
  manualSorting: true,
  manualFiltering: true,
  manualPagination: true,
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
    const first = sorting.value[0];
    if (serverMode.value) {
      props.onQueryChange!({
        ...props.query!,
        page: 0,
        sortBy: first?.id ?? undefined,
        sortDir: first ? (first.desc ? 'desc' : 'asc') : undefined,
      });
    }
  },
  onGlobalFilterChange: (updater) => {
    const next = typeof updater === 'function' ? updater(globalFilter.value) : updater;
    globalFilter.value = next;
    if (serverMode.value) props.onQueryChange!({ ...props.query!, page: 0, search: next || undefined });
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
    if (serverMode.value) {
      props.onQueryChange!({
        ...props.query!,
        page: pagination.value.pageIndex,
        pageSize: pagination.value.pageSize,
      });
    }
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value =
      typeof updater === 'function' ? updater(columnVisibility.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

const rows = computed(() => table.getRowModel().rows);
const resolvedTotal = computed(() =>
  serverMode.value ? (props.totalRows ?? 0) : table.getFilteredRowModel().rows.length,
);
const pageCount = computed(() => Math.max(Math.ceil(resolvedTotal.value / effectivePageSize.value), 1));
const effectivePageSize = computed(() =>
  serverMode.value ? (props.query?.pageSize ?? 10) : pagination.value.pageSize,
);
const effectiveSearch = computed(() => (serverMode.value ? (props.query?.search ?? '') : globalFilter.value));

const sortIndicator = (key: string) => {
  const entry = sorting.value.find((s) => s.id === key);
  return entry ? (entry.desc ? '▼' : '▲') : '';
};

function toggleSort(key: string) {
  const current = sorting.value.find((s) => s.id === key);
  const next: SortingState = !current
    ? [{ id: key, desc: false }]
    : current.desc
      ? []
      : [{ id: key, desc: true }];
  table.setSorting(next);
}

function onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  globalFilter.value = value;
  if (serverMode.value) props.onQueryChange!({ ...props.query!, page: 0, search: value || undefined });
}

function setPageSize(size: number) {
  pagination.value = { pageIndex: 0, pageSize: size };
  if (serverMode.value) props.onQueryChange!({ ...props.query!, page: 0, pageSize: size });
}

function setPage(index: number) {
  pagination.value = { ...pagination.value, pageIndex: index };
  if (serverMode.value) props.onQueryChange!({ ...props.query!, page: index });
}

const columnsPanelOpen = ref(false);

function cellValue(row: Record<string, unknown>, column: ProColumnDef<Record<string, unknown>>) {
  const path = (column as { accessor?: string }).accessor ?? column.key;
  return row[path];
}

function formatDate(value: unknown): string {
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function runAction(column: ActionColumnDef<Record<string, unknown>>, actionIndex: number, row: Record<string, unknown>) {
  column.actions[actionIndex]?.onSelect(row);
}
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative w-full max-w-xs sm:w-64">
        <input
          :value="effectiveSearch"
          type="text"
          :placeholder="searchPlaceholder"
          aria-label="Search table"
          class="h-9 w-full rounded-[10px] border border-input bg-fill px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
          @input="onSearch"
        />
      </div>

      <div class="relative">
        <button
          type="button"
          class="inline-flex h-8 items-center gap-1 rounded-[10px] border border-border bg-card px-3 text-[13px] font-medium hover:bg-accent"
          @click="columnsPanelOpen = !columnsPanelOpen"
        >
          Columns
        </button>
        <div
          v-if="columnsPanelOpen"
          class="absolute left-0 top-10 z-50 w-44 rounded-xl border border-border bg-popover/95 p-1 shadow-[var(--shadow-overlay)] backdrop-blur-xl"
        >
          <p class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Toggle columns</p>
          <label
            v-for="column in columns.filter((c) => c.valueType !== 'actions')"
            :key="column.key"
            class="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-accent"
          >
            {{ column.header }}
            <input
              type="checkbox"
              class="accent-[var(--primary)]"
              :checked="columnVisibility[column.key] !== false"
              @change="columnVisibility = { ...columnVisibility, [column.key]: !columnVisibility[column.key] }"
            />
          </label>
        </div>
      </div>
      <div class="ml-auto" />
    </div>

    <!-- Table card -->
    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div class="w-full overflow-x-auto">
        <table class="w-full caption-bottom text-sm">
          <thead>
            <tr class="[&_:not(:last-child)]:border-b">
              <th
                v-for="column in columns.filter((c) => columnVisibility[c.key] !== false)"
                :key="column.key"
                class="h-10 whitespace-nowrap px-3 text-left align-middle text-xs font-semibold tracking-[0.02em] text-muted-foreground"
              >
                <button
                  v-if="column.valueType !== 'actions' && column.sortable !== false"
                  type="button"
                  class="inline-flex h-6 items-center gap-1 rounded-md px-1 hover:bg-accent"
                  @click="toggleSort(column.key)"
                >
                  {{ column.header }}
                  <span class="text-[10px]">{{ sortIndicator(column.key) }}</span>
                </button>
                <template v-else>{{ column.header }}</template>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="error !== undefined">
              <td :colspan="columns.length" class="h-32 p-4 text-center">
                <p class="text-sm font-medium text-destructive">Failed to load data.</p>
              </td>
            </tr>
            <tr v-else-if="loading">
              <td :colspan="columns.length" class="p-4">
                <div class="flex flex-col gap-3">
                  <div v-for="i in 5" :key="i" class="h-6 w-full animate-pulse rounded-md bg-fill" />
                </div>
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td :colspan="columns.length" class="h-24 text-center text-muted-foreground">No results.</td>
            </tr>
            <template v-else>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-border transition-colors last:border-0 hover:bg-accent/60"
              >
                <td
                  v-for="column in columns.filter((c) => columnVisibility[c.key] !== false)"
                  :key="column.key"
                  class="whitespace-nowrap px-3 py-2.5 align-middle"
                >
                  <template v-if="column.valueType === 'actions'">
                    <div class="flex justify-end gap-1">
                      <button
                        v-for="(action, index) in (column as ActionColumnDef<Record<string, unknown>>).actions"
                        :key="action.label"
                        type="button"
                        class="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[13px] font-medium transition-all active:scale-[0.98]"
                        :class="
                          action.destructive
                            ? 'bg-destructive text-white hover:brightness-110'
                            : 'border border-border bg-card hover:bg-accent'
                        "
                        @click="runAction(column as ActionColumnDef<Record<string, unknown>>, index, row.original)"
                      >
                        {{ action.label }}
                      </button>
                    </div>
                  </template>
                  <template v-else-if="column.valueType === 'status'">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      :class="
                        cellValue(row.original, column)?.variant === 'success'
                          ? 'bg-green/15 text-green'
                          : 'bg-fill text-muted-foreground'
                      "
                    >
                      {{ cellValue(row.original, column)?.label ?? '—' }}
                    </span>
                  </template>
                  <template v-else-if="column.valueType === 'badge'">
                    <span class="inline-flex items-center rounded-full bg-fill px-2.5 py-0.5 text-xs text-muted-foreground">
                      {{ cellValue(row.original, column) ?? '—' }}
                    </span>
                  </template>
                  <template v-else-if="column.valueType === 'date'">
                    {{ formatDate(cellValue(row.original, column)) }}
                  </template>
                  <template v-else-if="cellValue(row.original, column) === null || cellValue(row.original, column) === undefined">
                    <span class="text-muted-foreground">—</span>
                  </template>
                  <template v-else>{{ String(cellValue(row.original, column)) }}</template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-1">
      <p class="text-sm text-muted-foreground">{{ resolvedTotal }} rows</p>
      <div class="flex items-center gap-4">
        <select
          class="h-8 rounded-[10px] border border-input bg-fill px-2 text-sm outline-none"
          :value="effectivePageSize"
          aria-label="Rows per page"
          @change="setPageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
        <span class="text-sm text-muted-foreground">Page {{ Math.min((serverMode ? query!.page : pagination.pageIndex) + 1, pageCount) }} of {{ pageCount }}</span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            :disabled="(serverMode ? query!.page : pagination.pageIndex) === 0"
            aria-label="Previous page"
            @click="setPage((serverMode ? query!.page : pagination.pageIndex) - 1)"
          >
            ‹
          </button>
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            :disabled="(serverMode ? query!.page : pagination.pageIndex) >= pageCount - 1"
            aria-label="Next page"
            @click="setPage((serverMode ? query!.page : pagination.pageIndex) + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

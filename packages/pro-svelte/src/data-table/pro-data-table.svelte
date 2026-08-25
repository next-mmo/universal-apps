<script lang="ts">
import type { Snippet } from 'svelte';
import type {
  ActionColumnDef,
  BadgeTone,
  ProColumnDef,
} from '@package/pro-core/src/table/columns';
import type { TableFeatures, TableQuery } from '@package/pro-core/src/table/features';
import {
  filterRows,
  pageRows,
  sortRows,
} from '@package/pro-core/src/table/client-engine';

interface Props {
  columns: Array<ProColumnDef<Record<string, unknown>>>;
  data: Array<Record<string, unknown>>;
  loading?: boolean;
  error?: unknown;
  features?: TableFeatures;
  query?: TableQuery;
  totalRows?: number;
  onQueryChange?: (query: TableQuery) => void;
  searchPlaceholder?: string;
  toolbarExtra?: Snippet;
}

let {
  columns,
  data,
  loading = false,
  error = undefined,
  features = {},
  query = undefined,
  totalRows = undefined,
  onQueryChange = undefined,
  searchPlaceholder = 'Search…',
  toolbarExtra,
}: Props = $props();

const serverMode = $derived(query !== undefined && onQueryChange !== undefined);
const pageSizeOptions = $derived(features.pageSizeOptions ?? [10, 20, 50]);

let search = $state('');
let sortState: { id: string; desc: boolean } | null = $state(null);
let pageIndex = $state(0);
let pageSize = $state(pageSizeOptions[0]);
let hiddenColumns = $state<string[]>([]);
let columnsOpen = $state(false);

const visibleColumns = $derived(columns.filter((c) => !hiddenColumns.includes(c.key)));
const effectiveSearch = $derived(serverMode ? (query?.search ?? '') : search);

const processed = $derived.by(() => {
  let rows = serverMode
    ? data
    : filterRows(data as never, effectiveSearch, columns as never);
  rows = serverMode
    ? rows
    : sortRows(rows as never, sortState?.id, sortState?.desc ? 'desc' : 'asc', columns as never);
  const total = rows.length;
  const size = serverMode ? (query?.pageSize ?? 10) : pageSize;
  const page = serverMode ? (query?.page ?? 0) : pageIndex;
  const sliced = serverMode ? rows : pageRows(rows as never, page, size);
  return { rows: sliced, total, pageCount: Math.max(Math.ceil(total / size), 1) };
});

function toggleSort(column: ProColumnDef<Record<string, unknown>>) {
  if (column.valueType === 'actions' || column.sortable === false) return;
  const next =
    sortState?.id !== column.key
      ? { id: column.key, desc: false }
      : !sortState.desc
        ? { id: column.key, desc: true }
        : null;
  sortState = next;
  onQueryChange?.({
    ...(query as TableQuery),
    page: 0,
    sortBy: next?.id ?? undefined,
    sortDir: next ? (next.desc ? 'desc' : 'asc') : undefined,
  });
}

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  search = value;
  pageIndex = 0;
  onQueryChange?.({
    ...(query as TableQuery),
    page: 0,
    search: value || undefined,
  });
}

function formatDate(value: unknown): string {
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function cellValue(
  row: Record<string, unknown>,
  column: ProColumnDef<Record<string, unknown>>,
): unknown {
  const path = (column as { accessor?: string }).accessor ?? column.key;
  return row[path];
}

function runAction(
  column: ActionColumnDef<Record<string, unknown>>,
  index: number,
  row: Record<string, unknown>,
) {
  column.actions[index]?.onSelect(row);
}
</script>

  <div class="flex w-full flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder={searchPlaceholder}
        aria-label="Search table"
        class="h-9 w-full max-w-xs rounded-[10px] border border-input bg-fill px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card sm:w-64"
        value={effectiveSearch}
        oninput={onSearchInput}
      />

      <div class="relative">
        <button
          type="button"
          class="inline-flex h-8 items-center rounded-[10px] border border-border bg-card px-3 text-[13px] font-medium hover:bg-accent"
          onclick={() => (columnsOpen = !columnsOpen)}
        >
          Columns
        </button>
        {#if columnsOpen}
          <div
            class="absolute top-10 left-0 z-50 w-44 rounded-xl border border-border bg-popover/95 p-1 shadow-[var(--shadow-overlay)] backdrop-blur-xl"
          >
            <p class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Toggle columns</p>
            {#each columns.filter((c) => c.valueType !== 'actions') as column (column.key)}
              <label
                class="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-accent"
              >
                {column.header}
                <input
                  type="checkbox"
                  class="accent-[var(--primary)]"
                  checked={!hiddenColumns.includes(column.key)}
                  onchange={() =>
                    (hiddenColumns = hiddenColumns.includes(column.key)
                      ? hiddenColumns.filter((k) => k !== column.key)
                      : [...hiddenColumns, column.key])}
                />
              </label>
            {/each}
          </div>
        {/if}
      </div>

      <div class="ml-auto">
        {@render toolbarExtra?.()}
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div class="w-full overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              {#each visibleColumns as column (column.key)}
                <th
                  class="h-10 border-b border-border whitespace-nowrap px-3 text-left align-middle text-xs font-semibold tracking-[0.02em] text-muted-foreground"
                >
                  {#if column.valueType !== 'actions'}
                    <button
                      type="button"
                      class="inline-flex h-6 items-center gap-1 rounded-md px-1 hover:bg-accent"
                      onclick={() => toggleSort(column)}
                    >
                      {column.header}
                      <span class="text-[10px]">
                        {sortState?.id === column.key ? (sortState.desc ? '▼' : '▲') : ''}
                      </span>
                    </button>
                  {:else}
                    {column.header}
                  {/if}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#if error !== undefined}
              <tr>
                <td colspan={columns.length} class="h-32 p-4 text-center">
                  <p class="text-sm font-medium text-destructive">Failed to load data.</p>
                </td>
              </tr>
            {:else if loading}
              <tr>
                <td colspan={columns.length} class="p-4">
                  <div class="flex flex-col gap-3">
                    {#each Array.from({ length: 5 }) as _, i (i)}
                      <div class="h-6 w-full animate-pulse rounded-md bg-fill" />
                    {/each}
                  </div>
                </td>
              </tr>
            {:else if processed.rows.length === 0}
              <tr>
                <td colspan={columns.length} class="h-24 text-center text-muted-foreground">
                  No results.
                </td>
              </tr>
            {:else}
              {#each processed.rows as row (String(row.id))}
                <tr class="border-b border-border transition-colors last:border-0 hover:bg-accent/60">
                  {#each visibleColumns as column (column.key)}
                    <td class="whitespace-nowrap px-3 py-2.5 align-middle">
                      {#if column.valueType === 'actions'}
                        <div class="flex justify-end gap-1">
                          {#each (column as ActionColumnDef<Record<string, unknown>>).actions as action, i (action.label)}
                            <button
                              type="button"
                              class="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[13px] font-medium transition-all active:scale-[0.98] {action.destructive
                                ? 'bg-destructive text-white hover:brightness-110'
                                : 'border border-border bg-card hover:bg-accent'}"
                              onclick={() => runAction(column as ActionColumnDef<Record<string, unknown>>, i, row)}
                            >
                              {action.label}
                            </button>
                          {/each}
                        </div>
                      {:else if column.valueType === 'status'}
                        {@const tone = cellValue(row, column) as Partial<BadgeTone> | undefined}
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {tone
                            ?.variant === 'success'
                            ? 'bg-green/15 text-green'
                            : 'bg-fill text-muted-foreground'}"
                        >
                          {tone?.label ?? '—'}
                        </span>
                      {:else if column.valueType === 'badge'}
                        <span
                          class="inline-flex items-center rounded-full bg-fill px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {cellValue(row, column) ?? '—'}
                        </span>
                      {:else if column.valueType === 'date'}
                        {formatDate(cellValue(row, column))}
                      {:else if cellValue(row, column) === null || cellValue(row, column) === undefined}
                        <span class="text-muted-foreground">—</span>
                      {:else}
                        {String(cellValue(row, column))}
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 px-1">
      <p class="text-sm text-muted-foreground">{processed.total} rows</p>
      <div class="flex items-center gap-4">
        <select
          class="h-8 rounded-[10px] border border-input bg-fill px-2 text-sm outline-none"
          aria-label="Rows per page"
          value={serverMode ? query?.pageSize : pageSize}
          onchange={(e) => {
            const size = Number((e.target as HTMLSelectElement).value);
            pageSize = size;
            pageIndex = 0;
            onQueryChange?.({ ...(query as TableQuery), page: 0, pageSize: size });
          }}
        >
          {#each pageSizeOptions as option (option)}
            <option value={option}>{option}</option>
          {/each}
        </select>
        <span class="text-sm text-muted-foreground">
          Page {(serverMode ? (query?.page ?? 0) : pageIndex) + 1} of {processed.pageCount}
        </span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            disabled={(serverMode ? (query?.page ?? 0) : pageIndex) === 0}
            aria-label="Previous page"
            onclick={() => {
              const next = (serverMode ? (query?.page ?? 0) : pageIndex) - 1;
              pageIndex = next;
              onQueryChange?.({ ...(query as TableQuery), page: next });
            }}
          >
            ‹
          </button>
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            disabled={(serverMode ? (query?.page ?? 0) : pageIndex) >= processed.pageCount - 1}
            aria-label="Next page"
            onclick={() => {
              const next = (serverMode ? (query?.page ?? 0) : pageIndex) + 1;
              pageIndex = next;
              onQueryChange?.({ ...(query as TableQuery), page: next });
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>

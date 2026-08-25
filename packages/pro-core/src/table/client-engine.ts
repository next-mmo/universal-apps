import type { ProColumnDef } from './columns';

/**
 * Framework-free client-side list pipeline shared by lightweight adapters
 * (Svelte today, more later). Heavier adapters may use TanStack Table's
 * row-model engines instead.
 */
export function filterRows<T extends Record<string, unknown>>(
  rows: Array<T>,
  search: string,
  columns: Array<ProColumnDef<T>>,
): Array<T> {
  const needle = search.trim().toLowerCase();
  if (needle === '') return rows;
  return rows.filter((row) =>
    columns.some((column) => {
      if (column.valueType === 'actions') return false;
      const value = row[(column as { accessor?: string }).accessor ?? column.key];
      return String(value ?? '').toLowerCase().includes(needle);
    }),
  );
}

export function sortRows<T extends Record<string, unknown>>(
  rows: Array<T>,
  sortBy: string | undefined,
  sortDir: 'asc' | 'desc' | undefined,
  columns: Array<ProColumnDef<T>>,
): Array<T> {
  if (sortBy === undefined || sortDir === undefined) return rows;
  const column = columns.find((c) => c.key === sortBy);
  if (column === undefined || column.valueType === 'actions') return rows;
  const path = (column as { accessor?: string }).accessor ?? column.key;
  const factor = sortDir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = a[path];
    const right = b[path];
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * factor;
    }
    return String(left ?? '').localeCompare(String(right ?? '')) * factor;
  });
}

export function pageRows<T>(rows: Array<T>, page: number, pageSize: number): Array<T> {
  const start = Math.max(page, 0) * pageSize;
  return rows.slice(start, start + pageSize);
}

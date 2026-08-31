/**
 * Framework-free column DSL for pro data tables.
 * Adapters (React/Vue/Svelte) map these to concrete cell renderers.
 */

export type ColumnValueType = 'text' | 'number' | 'date' | 'badge' | 'status' | 'actions';

export interface BadgeTone {
  label: string;
  /** Maps onto @package/ui badge variants. */
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
}

export interface BaseColumnDef {
  /** Unique key; also used as the default accessor path on row objects. */
  key: string;
  header: string;
  /** Defaults inferred from valueType; set to override sorting behavior. */
  sortable?: boolean;
  /** Hides the column from the default view; users can re-enable it. */
  hiddenByDefault?: boolean;
  width?: string;
}

export type TypedColumnDef<T> = BaseColumnDef & {
  valueType: Exclude<ColumnValueType, 'actions'>;
  /** Row property read for the cell; defaults to `key`. */
  accessor?: keyof T & string;
};

export type ActionColumnDef<T> = BaseColumnDef & {
  valueType: 'actions';
  actions: Array<{
    label: string;
    /** Destructive actions render in red and should confirm before running. */
    destructive?: boolean;
    hidden?: (row: T) => boolean;
    disabled?: boolean | ((row: T) => boolean);
    onSelect: (row: T) => void;
  }>;
};

export type ProColumnDef<T> = TypedColumnDef<T> | ActionColumnDef<T>;

export function isActionColumn<T>(column: ProColumnDef<T>): column is ActionColumnDef<T> {
  return column.valueType === 'actions';
}

/** Resolves the raw cell value for a row given a column definition. */
export function readCellValue<T>(row: T, column: ProColumnDef<T>, fallbackKey?: string): unknown {
  const path =
    column.valueType === 'actions'
      ? undefined
      : ((column.accessor ?? fallbackKey ?? column.key) as keyof T | undefined);
  return path === undefined ? undefined : row[path];
}

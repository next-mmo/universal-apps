import type { ProFormGroup } from '../form/schema';
import type { ProColumnDef } from '../table/columns';
import type { TableFeatures } from '../table/features';

interface ProResourceFormMode {
  title: string;
  description?: string;
  submitLabel?: string;
}

export interface ProResourceCreateForm<TValues extends object>
  extends ProResourceFormMode {
  values: TValues | (() => TValues);
}

export interface ProResourceEditForm<TRow, TValues extends object>
  extends ProResourceFormMode {
  values: (row: TRow) => TValues;
}

export interface ProResourceConfig<TRow, TValues extends object> {
  id: string;
  title: string;
  description?: string;
  breadcrumbs?: string[];
  getRowId: (row: TRow) => string;
  /** Data columns only. ProCrudPage appends one actions column when needed. */
  columns: Array<ProColumnDef<TRow>>;
  table?: {
    features?: TableFeatures;
    searchPlaceholder?: string;
  };
  form?: {
    schema: ProFormGroup[];
    create?: ProResourceCreateForm<TValues>;
    edit?: ProResourceEditForm<TRow, TValues>;
  };
  labels?: Partial<{
    create: string;
    edit: string;
    remove: string;
    removeTitle: string;
    removeDescription: string;
    cancel: string;
    confirmRemove: string;
  }>;
}

/** Preserves row and form-value inference while keeping resource definitions serial-looking. */
export function defineProResource<TRow, TValues extends object>(
  config: ProResourceConfig<TRow, TValues>,
): ProResourceConfig<TRow, TValues> {
  return config;
}

export * from './data-provider';

import { Badge } from '@package/ui/badge';
import { Button } from '@package/ui/button';
import { Checkbox } from '@package/ui/checkbox';

import type { ReactNode } from 'react';
import type {
  BadgeTone,
  ColumnValueType,
  ProColumnDef,
} from '@package/pro-core/table';
import type { ColumnDef, RowData } from '@tanstack/react-table';
import type { ProTableFeatures } from './pro-table-features';

function formatDate(value: unknown): string {
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function renderTypedCell(
  value: unknown,
  valueType: Exclude<ColumnValueType, 'actions'>,
): ReactNode {
  if (value === undefined || value === null || value === '') {
    return <span className='text-muted-foreground'>—</span>;
  }
  switch (valueType) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'date':
      return formatDate(value);
    case 'badge':
      return <Badge variant='secondary'>{String(value)}</Badge>;
    case 'status': {
      const tone = value as Partial<BadgeTone>;
      return <Badge variant={tone.variant ?? 'secondary'}>{tone.label ?? String(value)}</Badge>;
    }
    default:
      return String(value);
  }
}

/**
 * Maps framework-free pro-core column definitions onto TanStack Table defs.
 * This adapter layer is the only place that knows about both worlds.
 */
export function buildColumnDefs<T extends RowData>(
  columns: Array<ProColumnDef<T>>,
  options: { enableRowSelection?: boolean } = {},
): Array<ColumnDef<ProTableFeatures, T>> {
  const defs: Array<ColumnDef<ProTableFeatures, T>> = [];

  if (options.enableRowSelection) {
    defs.push({
      id: '__select__',
      enableSorting: false,
      enableHiding: false,
      header: () => null,
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label='Select row'
          onClick={(event) => event.stopPropagation()}
        />
      ),
    });
  }

  for (const column of columns) {
    if (column.valueType === 'actions') {
      defs.push({
        id: column.key,
        header: column.header,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className='flex justify-end gap-1'>
            {column.actions
              .filter((action) => action.hidden?.(row.original) !== true)
              .map((action) => (
                <Button
                  key={action.label}
                  size='sm'
                  variant={action.destructive ? 'destructive' : 'outline'}
                  disabled={
                    typeof action.disabled === 'function'
                      ? action.disabled(row.original)
                      : action.disabled
                  }
                  onClick={() => action.onSelect(row.original)}
                >
                  {action.label}
                </Button>
              ))}
          </div>
        ),
      });
      continue;
    }

    defs.push({
      id: column.key,
      header: column.header,
      enableSorting: column.sortable !== false,
      enableHiding: true,
      sortFn: column.valueType === 'number' ? 'basic' : 'alphanumeric',
      accessorFn: (row) => (row as Record<string, unknown>)[column.accessor ?? column.key],
      cell: (context) => renderTypedCell(context.getValue(), column.valueType),
    });
  }
  return defs;
}

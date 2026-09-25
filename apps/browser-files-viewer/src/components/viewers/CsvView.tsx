import { useMemo } from 'react';
import { ProDataTable } from '../../lib/universal/pro/data-table/pro-data-table';
import type { ProColumnDef } from '../../lib/universal/pro-core/table/columns';
import { toCsvTable } from '../../lib/csv';

type CsvRow = Record<string, string> & { __id: string };

export function CsvView({ text, name }: { text: string; name: string }): React.JSX.Element {
  const table = useMemo(() => toCsvTable(name, text), [text, name]);
  const rows = useMemo<CsvRow[]>(
    () => table.rows.map((row, i) => ({ ...row, __id: String(i) })),
    [table.rows],
  );

  const columns = useMemo<Array<ProColumnDef<CsvRow>>>(
    () => table.columns.map((col) => ({ key: col, header: col, valueType: 'text' as const })),
    [table.columns],
  );

  if (table.columns.length === 0) {
    return <p className="p-6 text-sm text-(--muted-foreground)">This file has no tabular rows.</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <div className="min-h-0 flex-1 overflow-hidden">
        <ProDataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.__id}
          features={{ sorting: true, globalFilter: true, pagination: true, pageSizeOptions: [25, 50, 100] }}
          searchPlaceholder="Filter rows…"
        />
      </div>
      {table.truncated && (
        <p className="text-xs text-amber-400">
          Showing the first {table.rows.length} of more rows — larger sheets were truncated for preview.
        </p>
      )}
    </div>
  );
}

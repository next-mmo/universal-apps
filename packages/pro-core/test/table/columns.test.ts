import { describe, expect, it } from 'vitest';

import { isActionColumn, readCellValue } from '../../src/table/columns.ts';
import type { ActionColumnDef, ProColumnDef } from '../../src/table/columns.ts';

type Row = { id: number; name: string; nested?: { label: string } };

const actionColumn: ActionColumnDef<Row> = {
  key: 'actions',
  header: '',
  valueType: 'actions',
  actions: [{ label: 'Delete', destructive: true, onSelect: () => {} }],
};

describe('isActionColumn', () => {
  it('narrows action columns and rejects typed columns', () => {
    expect(isActionColumn(actionColumn)).toBe(true);
    expect(isActionColumn<Row>({ key: 'name', header: 'Name', valueType: 'text' })).toBe(false);
  });
});

describe('readCellValue', () => {
  const row: Row = { id: 7, name: 'Ada', nested: { label: 'inner' } };

  it('reads the value at the column key by default', () => {
    const column: ProColumnDef<Row> = { key: 'name', header: 'Name', valueType: 'text' };
    expect(readCellValue(row, column)).toBe('Ada');
  });

  it('prefers an explicit accessor over the key', () => {
    const column: ProColumnDef<Row> = {
      key: 'title',
      header: 'Title',
      valueType: 'text',
      accessor: 'name',
    };
    expect(readCellValue(row, column)).toBe('Ada');
  });

  it('uses the fallback key when the column declares no accessor', () => {
    const column: ProColumnDef<Row> = { key: 'title', header: 'Title', valueType: 'text' };
    expect(readCellValue(row, column, 'name')).toBe('Ada');
  });

  it('returns undefined for an action column', () => {
    // Action columns render controls, not cell data, so there is no value to read.
    expect(readCellValue(row, actionColumn)).toBeUndefined();
    expect(readCellValue(row, actionColumn, 'name')).toBeUndefined();
  });

  it('returns undefined for a key that is absent from the row', () => {
    const column: ProColumnDef<Row> = { key: 'missing', header: 'Missing', valueType: 'text' };
    expect(readCellValue(row, column)).toBeUndefined();
  });
});

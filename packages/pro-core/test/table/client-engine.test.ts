import { describe, expect, it } from 'vitest';

import { filterRows, pageRows, sortRows } from '../../src/table/client-engine.ts';
import type { ProColumnDef } from '../../src/table/columns.ts';

type Row = { id: number; name: string; score: number; note?: string | null };

const columns: Array<ProColumnDef<Row>> = [
  { key: 'id', header: 'ID', valueType: 'number' },
  { key: 'name', header: 'Name', valueType: 'text' },
  { key: 'score', header: 'Score', valueType: 'number' },
  { key: 'note', header: 'Note', valueType: 'text' },
  {
    key: 'actions',
    header: '',
    valueType: 'actions',
    actions: [{ label: 'Open', onSelect: () => {} }],
  },
];

const rows: Row[] = [
  { id: 3, name: 'Carol', score: 30, note: null },
  { id: 1, name: 'alice', score: 10, note: 'first' },
  { id: 2, name: 'Bob', score: 20, note: undefined },
];

describe('filterRows', () => {
  it('returns the input unchanged for an empty or whitespace-only search', () => {
    expect(filterRows(rows, '', columns)).toBe(rows);
    expect(filterRows(rows, '   ', columns)).toBe(rows);
  });

  it('matches case-insensitively across text and number columns', () => {
    expect(filterRows(rows, 'ALICE', columns).map((row) => row.id)).toEqual([1]);
    expect(filterRows(rows, '2', columns).map((row) => row.id)).toEqual([2]);
  });

  it('ignores null and undefined cell values instead of matching them', () => {
    expect(filterRows(rows, 'null', columns)).toEqual([]);
    expect(filterRows(rows, 'undefined', columns)).toEqual([]);
  });

  it('never matches on an actions column', () => {
    // The actions column carries no data, so a search for its key must find nothing.
    expect(filterRows(rows, 'actions', columns)).toEqual([]);
  });

  it('reads through an explicit accessor instead of the column key', () => {
    const aliased: Array<ProColumnDef<Row>> = [
      { key: 'display', header: 'Display', valueType: 'text', accessor: 'name' },
    ];
    expect(filterRows(rows, 'carol', aliased).map((row) => row.id)).toEqual([3]);
  });
});

describe('sortRows', () => {
  it('returns the input unchanged when no sort is requested', () => {
    expect(sortRows(rows, undefined, 'asc', columns)).toBe(rows);
    expect(sortRows(rows, 'name', undefined, columns)).toBe(rows);
  });

  it('returns the input unchanged for an unknown column', () => {
    expect(sortRows(rows, 'missing', 'asc', columns)).toBe(rows);
  });

  it('returns the input unchanged for an actions column', () => {
    expect(sortRows(rows, 'actions', 'asc', columns)).toBe(rows);
  });

  it('orders numbers numerically rather than lexically', () => {
    // Lexical ordering would put 10 before 3.
    expect(sortRows(rows, 'id', 'asc', columns).map((row) => row.id)).toEqual([1, 2, 3]);
  });

  it('reverses the order for descending', () => {
    expect(sortRows(rows, 'score', 'desc', columns).map((row) => row.score)).toEqual([30, 20, 10]);
  });

  it('orders strings case-insensitively enough to be predictable', () => {
    const sorted = sortRows(rows, 'name', 'asc', columns).map((row) => row.name);
    expect(sorted).toHaveLength(3);
    expect(sorted).toContain('alice');
    expect(sorted[0]?.toLowerCase()).toBe('alice');
  });

  it('does not mutate the caller’s array', () => {
    const before = rows.map((row) => row.id);
    sortRows(rows, 'id', 'desc', columns);
    expect(rows.map((row) => row.id)).toEqual(before);
  });

  it('sorts rows with missing values without throwing', () => {
    const sorted = sortRows(rows, 'note', 'asc', columns);
    expect(sorted).toHaveLength(3);
  });
});

describe('pageRows', () => {
  it('slices the requested page', () => {
    expect(pageRows([1, 2, 3, 4, 5], 1, 2)).toEqual([3, 4]);
  });

  it('returns an empty array past the end', () => {
    expect(pageRows([1, 2, 3], 5, 2)).toEqual([]);
  });

  it('clamps a negative page to the first page', () => {
    expect(pageRows([1, 2, 3], -3, 2)).toEqual([1, 2]);
  });
});

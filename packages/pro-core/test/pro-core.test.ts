import { describe, expect, it } from 'vitest';

import { queryKeys } from '../src/query/keys.ts';
import { defineProResource } from '../src/resource/definition.ts';
import { buildTableQuery, defaultTableFeatures } from '../src/table/features.ts';
import type { ProColumnDef } from '../src/table/columns.ts';

type Row = { id: string; name: string };

describe('queryKeys', () => {
  it('namespaces table keys by resource and params', () => {
    expect(queryKeys.table('items', { page: 1 })).toEqual(['pro', 'table', 'items', { page: 1 }]);
  });

  it('keeps detail keys distinct per id', () => {
    expect(queryKeys.detail('items', 1)).not.toEqual(queryKeys.detail('items', 2));
    expect(queryKeys.detail('items', 'a')).toEqual(['pro', 'detail', 'items', 'a']);
  });

  it('scopes stats keys to the resource', () => {
    expect(queryKeys.stats('items')).toEqual(['pro', 'stats', 'items']);
  });
});

describe('buildTableQuery', () => {
  it('fills the optional fields with undefined so the shape is stable', () => {
    expect(buildTableQuery({ page: 0, pageSize: 10 })).toEqual({
      page: 0,
      pageSize: 10,
      sortBy: undefined,
      sortDir: undefined,
      search: undefined,
    });
  });

  it('keeps every supplied field', () => {
    expect(buildTableQuery({ page: 2, pageSize: 25, sortBy: 'name', sortDir: 'desc', search: 'ab' })).toEqual({
      page: 2,
      pageSize: 25,
      sortBy: 'name',
      sortDir: 'desc',
      search: 'ab',
    });
  });

  it('offers the documented default page sizes', () => {
    expect(defaultTableFeatures.pageSizeOptions).toEqual([10, 20, 50]);
  });
});

describe('defineProResource', () => {
  it('returns the configuration unchanged so row types stay inferred', () => {
    const columns: Array<ProColumnDef<Row>> = [{ key: 'name', header: 'Name', valueType: 'text' }];
    const config = {
      id: 'items',
      title: 'Items',
      getRowId: (row: Row) => row.id,
      columns,
    };

    // The helper exists for inference only; it must not clone or normalize anything.
    expect(defineProResource<Row, { name: string }>(config)).toBe(config);
  });
});

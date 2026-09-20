import { describe, expect, it, vi } from 'vitest';

import {
  createLocalStorageDataProvider,
  createMemoryDataProvider,
  createRestDataProvider,
} from '../../src/resource/data-provider.ts';

type Row = { id: string | number; name: string; score: number };

const rows: Row[] = [
  { id: 'a', name: 'Alpha', score: 30 },
  { id: 'b', name: 'Beta', score: 10 },
  { id: 'c', name: 'Gamma', score: 20 },
];

describe('createMemoryDataProvider', () => {
  it('returns every row and the total when no pagination is requested', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const result = await provider.getList<Row>('items');

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('treats the page number as one-based, matching the REST query it mirrors', async () => {
    const provider = createMemoryDataProvider({ items: rows });

    const first = await provider.getList<Row>('items', { pagination: { page: 1, pageSize: 2 } });
    const second = await provider.getList<Row>('items', { pagination: { page: 2, pageSize: 2 } });

    expect(first.data.map((row) => row.id)).toEqual(['a', 'b']);
    expect(second.data.map((row) => row.id)).toEqual(['c']);
    expect(first.total).toBe(3);
  });

  it('filters string columns by case-insensitive substring', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const result = await provider.getList<Row>('items', { filters: { name: 'ET' } });

    expect(result.data.map((row) => row.id)).toEqual(['b']);
  });

  it('filters non-string columns by equality', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const result = await provider.getList<Row>('items', { filters: { score: 20 } });

    expect(result.data.map((row) => row.id)).toEqual(['c']);
  });

  it('ignores empty filter values instead of matching nothing', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const result = await provider.getList<Row>('items', {
      filters: { name: '', score: undefined, missing: null },
    });

    expect(result.data).toHaveLength(3);
  });

  it('sorts ascending and descending', async () => {
    const provider = createMemoryDataProvider({ items: rows });

    const ascending = await provider.getList<Row>('items', { sort: { field: 'score', order: 'asc' } });
    const descending = await provider.getList<Row>('items', { sort: { field: 'score', order: 'desc' } });

    expect(ascending.data.map((row) => row.score)).toEqual([10, 20, 30]);
    expect(descending.data.map((row) => row.score)).toEqual([30, 20, 10]);
  });

  it('hands out copies so a caller cannot mutate the store by accident', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const result = await provider.getList<Row>('items');

    // getOne/create/update all return copies; getList must not be the one that leaks the store.
    result.data[0]!.name = 'mutated';

    const reread = await provider.getOne<Row>('items', 'a');
    expect(reread.name).toBe('Alpha');
  });

  it('does not alias the caller’s initial data', async () => {
    const seed: Row[] = [{ id: 'x', name: 'Seed', score: 1 }];
    const provider = createMemoryDataProvider({ items: seed });

    seed[0]!.name = 'changed outside';

    const result = await provider.getOne<Row>('items', 'x');
    expect(result.name).toBe('Seed');
  });

  it('reports a missing record rather than returning undefined', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    await expect(provider.getOne('items', 'nope')).rejects.toThrow(/not found/i);
  });

  it('keeps a supplied id and generates one when it is absent', async () => {
    const provider = createMemoryDataProvider({ items: [] });

    const supplied = await provider.create<Row>('items', { id: 'fixed', name: 'A', score: 1 });
    const generated = await provider.create<Row>('items', { name: 'B', score: 2 });

    expect(supplied.id).toBe('fixed');
    expect(generated.id).toBeTypeOf('string');
    expect(String(generated.id).length).toBeGreaterThan(0);
  });

  it('merges an update and preserves the id', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    const updated = await provider.update<Row>('items', 'a', { name: 'Renamed' });

    expect(updated).toEqual({ id: 'a', name: 'Renamed', score: 30 });
  });

  it('rejects an update or delete for a missing record', async () => {
    const provider = createMemoryDataProvider({ items: rows });
    await expect(provider.update('items', 'nope', { name: 'x' })).rejects.toThrow(/not found/i);
    await expect(provider.delete('items', 'nope')).rejects.toThrow(/not found/i);
  });

  it('deletes one record and many records', async () => {
    const provider = createMemoryDataProvider({ items: rows });

    await provider.delete('items', 'a');
    await provider.deleteMany!('items', ['b']);

    const remaining = await provider.getList<Row>('items');
    expect(remaining.data.map((row) => row.id)).toEqual(['c']);
  });
});

describe('createLocalStorageDataProvider', () => {
  const createStorage = () => {
    const map = new Map<string, string>();
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      map,
    };
  };

  it('persists a created record under the configured prefix', async () => {
    const storage = createStorage();
    const provider = createLocalStorageDataProvider({ storage, prefix: 'test_' });

    await provider.create<Row>('items', { id: 'a', name: 'Alpha', score: 1 });

    expect(storage.map.has('test_items')).toBe(true);
    const reread = await provider.getList<Row>('items');
    expect(reread.data.map((row) => row.id)).toEqual(['a']);
  });

  it('starts empty when the stored payload is not valid JSON', async () => {
    const storage = createStorage();
    storage.setItem('pro_data_items', '{not json');
    const provider = createLocalStorageDataProvider({ storage });

    // A corrupt payload must not throw out of the provider.
    await expect(provider.getList<Row>('items')).resolves.toEqual({ data: [], total: 0, page: 1, pageSize: 10 });
  });

  it('persists updates and deletes', async () => {
    const storage = createStorage();
    const provider = createLocalStorageDataProvider({ storage });
    await provider.create<Row>('items', { id: 'a', name: 'Alpha', score: 1 });

    await provider.update<Row>('items', 'a', { score: 9 });
    let reread = await provider.getOne<Row>('items', 'a');
    expect(reread).toEqual({ id: 'a', name: 'Alpha', score: 9 });

    await provider.delete('items', 'a');
    reread = await provider.getList<Row>('items').then((result) => result.data as never);
    expect(reread).toEqual([]);
  });

  it('reports a missing record instead of silently succeeding', async () => {
    const storage = createStorage();
    const provider = createLocalStorageDataProvider({ storage });
    await expect(provider.getOne('items', 'nope')).rejects.toThrow(/not found/i);
  });
});

describe('createRestDataProvider', () => {
  const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number; statusText?: string } = {}) =>
    ({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: init.statusText ?? 'OK',
      json: async () => body,
    }) as unknown as Response;

  const createFetch = (body: unknown, init?: { ok?: boolean; status?: number; statusText?: string }) => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = (async (url: string | URL | Request, requestInit?: RequestInit) => {
      calls.push({ url: String(url), init: requestInit });
      return jsonResponse(body, init);
    }) as unknown as typeof fetch;
    return { fetcher, calls };
  };

  it('refuses to construct when no fetch implementation is available', () => {
    vi.stubGlobal('fetch', undefined);
    try {
      expect(() => createRestDataProvider('https://api.test')).toThrow(/fetch is not available/i);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('falls back to the global fetch when the option is omitted', async () => {
    const { fetcher, calls } = createFetch({ data: [], total: 0 });
    vi.stubGlobal('fetch', fetcher);
    try {
      const provider = createRestDataProvider('https://api.test');
      await provider.getList('items');
      expect(calls).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('serializes pagination, sort, and filters into the query string', async () => {
    const { fetcher, calls } = createFetch({ data: [], total: 0 });
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    await provider.getList('items', {
      pagination: { page: 2, pageSize: 25 },
      sort: { field: 'name', order: 'desc' },
      filters: { name: 'alp', score: 3, skip: '' },
    });

    const url = new URL(calls[0]!.url);
    expect(url.pathname).toBe('/items');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('25');
    expect(url.searchParams.get('sort')).toBe('name');
    expect(url.searchParams.get('order')).toBe('desc');
    expect(url.searchParams.get('filter[name]')).toBe('alp');
    expect(url.searchParams.get('filter[score]')).toBe('3');
    // An empty filter value is an absent filter, not an empty-string match.
    expect(url.searchParams.has('filter[skip]')).toBe(false);
  });

  it('normalizes a base URL that ends in slashes', async () => {
    const { fetcher, calls } = createFetch({ data: [], total: 0 });
    const provider = createRestDataProvider('https://api.test///', { fetch: fetcher });

    await provider.getList('items');

    expect(calls[0]!.url).toBe('https://api.test/items');
  });

  it('unwraps a data envelope and carries the total through', async () => {
    const { fetcher } = createFetch({ data: rows, total: 99, page: 2, pageSize: 3 });
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    const result = await provider.getList<Row>('items');

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(99);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
  });

  it('accepts a bare array response and derives the total from its length', async () => {
    const { fetcher } = createFetch(rows);
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    const result = await provider.getList<Row>('items');

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('surfaces a non-ok response as an error naming the status', async () => {
    const { fetcher } = createFetch({}, { ok: false, status: 503, statusText: 'Unavailable' });
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    await expect(provider.getList('items')).rejects.toThrow(/503/);
  });

  it('sends JSON content type and merges caller headers', async () => {
    const { fetcher, calls } = createFetch({ data: [], total: 0 });
    const provider = createRestDataProvider('https://api.test', {
      fetch: fetcher,
      headers: { Authorization: 'Bearer token' },
    });

    await provider.getList('items');

    expect(calls[0]!.init?.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    });
  });

  it('awaits an async header factory', async () => {
    const { fetcher, calls } = createFetch({ data: [], total: 0 });
    const provider = createRestDataProvider('https://api.test', {
      fetch: fetcher,
      headers: async () => ({ Authorization: 'Bearer async' }),
    });

    await provider.getList('items');

    expect(calls[0]!.init?.headers).toMatchObject({ Authorization: 'Bearer async' });
  });

  it('uses POST for create, PUT for update, DELETE for delete, and a batch route for deleteMany', async () => {
    const { fetcher, calls } = createFetch({ data: { id: 1 } });
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    await provider.create('items', { name: 'A' });
    await provider.update('items', 1, { name: 'B' });
    await provider.delete('items', 1);
    await provider.deleteMany!('items', [1, 2]);

    expect(calls.map((call) => [call.init?.method, new URL(call.url).pathname])).toEqual([
      ['POST', '/items'],
      ['PUT', '/items/1'],
      ['DELETE', '/items/1'],
      ['POST', '/items/batch-delete'],
    ]);
    expect(calls[3]!.init?.body).toBe(JSON.stringify({ ids: [1, 2] }));
  });

  it('unwraps a single-record envelope for getOne', async () => {
    const { fetcher } = createFetch({ data: { id: 7, name: 'Solo' } });
    const provider = createRestDataProvider('https://api.test', { fetch: fetcher });

    await expect(provider.getOne('items', 7)).resolves.toEqual({ id: 7, name: 'Solo' });
  });
});

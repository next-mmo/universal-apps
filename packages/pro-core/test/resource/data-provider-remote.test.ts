import { describe, expect, it } from 'vitest';

import {
  createSqliteDataProvider,
  createSupabaseDataProvider,
} from '../../src/resource/data-provider.ts';
import type { SqlExecutor } from '../../src/resource/data-provider.ts';

type Row = { id: number; name: string };

const createExecutor = (rows: Array<Record<string, unknown>> = []) => {
  const selects: Array<{ query: string; params?: unknown[] }> = [];
  const executions: Array<{ query: string; params?: unknown[] }> = [];
  const executor: SqlExecutor = {
    async select<T>(query: string, params?: unknown[]) {
      selects.push({ query, params });
      // The count query is answered from the fixture size so pagination math is observable.
      if (/COUNT\(\*\)/i.test(query)) return [{ count: rows.length }] as unknown as T[];
      return rows as unknown as T[];
    },
    async execute(query: string, params?: unknown[]) {
      executions.push({ query, params });
      return { rowsAffected: 1, lastInsertId: 7 };
    },
  };
  return { executor, selects, executions };
};

describe('createSqliteDataProvider', () => {
  it('counts and selects with parameterized filter values', async () => {
    const { executor, selects } = createExecutor([{ id: 1, name: 'Alpha' }]);
    const provider = createSqliteDataProvider({ executor });

    const result = await provider.getList<Row>('items', { filters: { name: 'Alpha', skip: '' } });

    expect(result.total).toBe(1);
    expect(selects).toHaveLength(2);
    expect(selects[0]!.query).toBe('SELECT COUNT(*) as count FROM "items" WHERE "name" = ?');
    // Filter values travel as bound parameters, never concatenated into the statement.
    expect(selects[0]!.params).toEqual(['Alpha']);
    expect(selects[1]!.query).toBe('SELECT * FROM "items" WHERE "name" = ?');
  });

  it('appends ORDER BY and one-based LIMIT/OFFSET', async () => {
    const { executor, selects } = createExecutor();
    const provider = createSqliteDataProvider({ executor });

    await provider.getList('items', {
      sort: { field: 'name', order: 'desc' },
      pagination: { page: 3, pageSize: 10 },
    });

    // Whitespace is normalized: an absent WHERE clause leaves a blank slot in the template.
    expect(selects[1]!.query.replace(/\s+/g, ' ')).toBe(
      'SELECT * FROM "items" ORDER BY "name" DESC LIMIT ? OFFSET ?',
    );
    expect(selects[1]!.params).toEqual([10, 20]);
  });

  it('falls back to the first page for a non-positive page number', async () => {
    const { executor, selects } = createExecutor();
    const provider = createSqliteDataProvider({ executor });

    await provider.getList('items', { pagination: { page: 0, pageSize: 5 } });

    expect(selects[1]!.params).toEqual([5, 0]);
  });

  it('reports a missing row rather than returning undefined', async () => {
    const { executor } = createExecutor([]);
    const provider = createSqliteDataProvider({ executor });

    await expect(provider.getOne('items', 1)).rejects.toThrow(/not found/i);
  });

  it('refuses to insert a record with no columns', async () => {
    const { executor } = createExecutor();
    const provider = createSqliteDataProvider({ executor });

    await expect(provider.create('items', {})).rejects.toThrow(/empty record/i);
  });

  it('reads the created row back using the inserted id', async () => {
    const { executor, executions } = createExecutor([{ id: 7, name: 'Alpha' }]);
    const provider = createSqliteDataProvider({ executor });

    const created = await provider.create<Row>('items', { name: 'Alpha' });

    expect(executions[0]!.query).toBe('INSERT INTO "items" ("name") VALUES (?)');
    expect(executions[0]!.params).toEqual(['Alpha']);
    expect(created).toEqual({ id: 7, name: 'Alpha' });
  });

  it('keeps working when its methods are destructured', async () => {
    const { executor } = createExecutor([{ id: 7, name: 'Alpha' }]);
    const { create } = createSqliteDataProvider({ executor });

    // A consumer may destructure the provider; the method must not depend on its receiver.
    await expect(create<Row>('items', { name: 'Alpha' })).resolves.toEqual({ id: 7, name: 'Alpha' });
  });

  it('never sets the id column in an update', async () => {
    const { executor, executions } = createExecutor([{ id: 7, name: 'Renamed' }]);
    const provider = createSqliteDataProvider({ executor });

    await provider.update<Row>('items', 7, { id: 999, name: 'Renamed' });

    expect(executions[0]!.query).toBe('UPDATE "items" SET "name" = ? WHERE "id" = ?');
    expect(executions[0]!.params).toEqual(['Renamed', 7]);
  });

  it('honours a custom primary key field', async () => {
    const { executor, executions } = createExecutor([{ uuid: 'abc' }]);
    const provider = createSqliteDataProvider({ executor, idField: 'uuid' });

    await provider.delete('items', 'abc');

    expect(executions[0]!.query).toBe('DELETE FROM "items" WHERE "uuid" = ?');
  });

  it('skips the delete-many statement entirely for an empty id list', async () => {
    const { executor, executions } = createExecutor();
    const provider = createSqliteDataProvider({ executor });

    await expect(provider.deleteMany!('items', [])).resolves.toEqual({ ids: [] });
    expect(executions).toHaveLength(0);
  });

  it('binds every id in a delete-many statement', async () => {
    const { executor, executions } = createExecutor();
    const provider = createSqliteDataProvider({ executor });

    await provider.deleteMany!('items', [1, 2, 3]);

    expect(executions[0]!.query).toBe('DELETE FROM "items" WHERE "id" IN (?, ?, ?)');
    expect(executions[0]!.params).toEqual([1, 2, 3]);
  });
});

describe('createSupabaseDataProvider', () => {
  const createFetch = (options: { body?: unknown; contentRange?: string | null; ok?: boolean; status?: number } = {}) => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return {
        ok: options.ok ?? true,
        status: options.status ?? 200,
        statusText: 'OK',
        headers: { get: (name: string) => (name.toLowerCase() === 'content-range' ? options.contentRange ?? null : null) },
        json: async () => options.body ?? [],
      } as unknown as Response;
    }) as unknown as typeof fetch;
    return { fetcher, calls };
  };

  const providerFor = (fetcher: typeof fetch) =>
    createSupabaseDataProvider({ supabaseUrl: 'https://project.supabase.co/', supabaseKey: 'secret', fetch: fetcher });

  it('sends the API key as both apikey and bearer authorization', async () => {
    const { fetcher, calls } = createFetch();
    await providerFor(fetcher).getList('items');

    expect(calls[0]!.init?.headers).toMatchObject({
      apikey: 'secret',
      Authorization: 'Bearer secret',
      Prefer: 'count=exact',
    });
  });

  it('maps filters, sort, and one-based range pagination onto query parameters', async () => {
    const { fetcher, calls } = createFetch();
    await providerFor(fetcher).getList('items', {
      filters: { name: 'Alpha', skip: '' },
      sort: { field: 'name', order: 'desc' },
      pagination: { page: 3, pageSize: 10 },
    });

    const url = new URL(calls[0]!.url);
    expect(url.pathname).toBe('/rest/v1/items');
    expect(url.searchParams.get('name')).toBe('eq.Alpha');
    expect(url.searchParams.has('skip')).toBe(false);
    expect(url.searchParams.get('order')).toBe('name.desc');
    // Page 3 of size 10 is the inclusive byte range 20-29.
    expect(calls[0]!.init?.headers).toMatchObject({ Range: '20-29', 'Range-Unit': 'items' });
  });

  it('reads the exact total from the content-range header', async () => {
    const { fetcher } = createFetch({ body: [{ id: 1 }], contentRange: '0-9/42' });
    const result = await providerFor(fetcher).getList('items');

    expect(result.total).toBe(42);
  });

  it('falls back to the returned row count when no range header is present', async () => {
    const { fetcher } = createFetch({ body: [{ id: 1 }, { id: 2 }], contentRange: null });
    const result = await providerFor(fetcher).getList('items');

    expect(result.total).toBe(2);
  });

  it('requests a single object and encodes the id for getOne', async () => {
    const { fetcher, calls } = createFetch({ body: { id: 1, name: 'Alpha' } });
    const result = await providerFor(fetcher).getOne<Row>('items', 'a b');

    expect(calls[0]!.url).toContain('id=eq.a%20b');
    expect(calls[0]!.init?.headers).toMatchObject({ Accept: 'application/vnd.pgrst.object+json' });
    expect(result).toEqual({ id: 1, name: 'Alpha' });
  });

  it('unwraps the representation array returned by create and update', async () => {
    const { fetcher, calls } = createFetch({ body: [{ id: 1, name: 'Alpha' }] });
    const provider = providerFor(fetcher);

    await expect(provider.create<Row>('items', { name: 'Alpha' })).resolves.toEqual({ id: 1, name: 'Alpha' });
    await expect(provider.update<Row>('items', 1, { name: 'Beta' })).resolves.toEqual({ id: 1, name: 'Alpha' });

    expect(calls.map((call) => call.init?.method)).toEqual(['POST', 'PATCH']);
    expect(calls[0]!.init?.headers).toMatchObject({ Prefer: 'return=representation' });
  });

  it('encodes every id in a delete-many filter', async () => {
    const { fetcher, calls } = createFetch();
    const provider = providerFor(fetcher);

    await provider.deleteMany!('items', ['a b', 2]);

    expect(calls[0]!.init?.method).toBe('DELETE');
    // Asserted on the raw URL: searchParams would decode the percent-escapes back to spaces.
    expect(calls[0]!.url).toContain('id=in.(a%20b,2)');
  });

  it('skips the request entirely for an empty id list', async () => {
    const { fetcher, calls } = createFetch();
    const provider = providerFor(fetcher);

    await expect(provider.deleteMany!('items', [])).resolves.toEqual({ ids: [] });
    expect(calls).toHaveLength(0);
  });

  it('surfaces a failed request as an error naming the status', async () => {
    const { fetcher } = createFetch({ ok: false, status: 401 });
    const provider = providerFor(fetcher);

    await expect(provider.getList('items')).rejects.toThrow(/401/);
  });
});

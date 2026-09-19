export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export type FilterParams = Record<string, unknown>;

export interface GetListParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
}

export interface GetListResult<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Standard framework-free DataProvider interface.
 * Connects table engines, forms, and CRUD workflows to any persistence backend.
 */
export interface DataProvider {
  getList<T = Record<string, unknown>>(
    resource: string,
    params?: GetListParams,
  ): Promise<GetListResult<T>>;

  getOne<T = Record<string, unknown>>(
    resource: string,
    id: string | number,
  ): Promise<T>;

  create<T = Record<string, unknown>>(
    resource: string,
    data: Partial<T>,
  ): Promise<T>;

  update<T = Record<string, unknown>>(
    resource: string,
    id: string | number,
    data: Partial<T>,
  ): Promise<T>;

  delete(
    resource: string,
    id: string | number,
  ): Promise<{ id: string | number }>;

  deleteMany?(
    resource: string,
    ids: Array<string | number>,
  ): Promise<{ ids: Array<string | number> }>;
}

/**
 * In-memory data provider for offline prototypes, unit tests, and mock state.
 */
export function createMemoryDataProvider(
  initialData: Record<string, Array<Record<string, unknown>>> = {},
): DataProvider {
  const store = new Map<string, Array<Record<string, unknown>>>();

  for (const [key, items] of Object.entries(initialData)) {
    store.set(key, items.map((item) => ({ ...item })));
  }

  const getCollection = (resource: string) => {
    if (!store.has(resource)) store.set(resource, []);
    return store.get(resource)!;
  };

  return {
    async getList<T = Record<string, unknown>>(resource: string, params?: GetListParams) {
      let items = [...getCollection(resource)] as unknown as T[];

      // Filter
      if (params?.filters) {
        items = items.filter((item: any) => {
          for (const [key, val] of Object.entries(params.filters!)) {
            if (val === undefined || val === null || val === '') continue;
            const itemVal = item[key];
            if (typeof val === 'string' && typeof itemVal === 'string') {
              if (!itemVal.toLowerCase().includes(val.toLowerCase())) return false;
            } else if (itemVal !== val) {
              return false;
            }
          }
          return true;
        });
      }

      // Sort
      if (params?.sort) {
        const { field, order } = params.sort;
        items.sort((a: any, b: any) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          const cmp = valA > valB ? 1 : -1;
          return order === 'asc' ? cmp : -cmp;
        });
      }

      const total = items.length;
      const page = params?.pagination?.page ?? 1;
      const pageSize = params?.pagination?.pageSize ?? (total > 0 ? total : 10);
      const start = (page - 1) * pageSize;
      const paginated = items.slice(start, start + pageSize);

      return {
        data: paginated,
        total,
        page,
        pageSize,
      };
    },

    async getOne<T = Record<string, unknown>>(resource: string, id: string | number) {
      const items = getCollection(resource);
      const found = items.find((item) => String(item.id) === String(id));
      if (!found) throw new Error(`Record ${id} not found in ${resource}`);
      return { ...found } as unknown as T;
    },

    async create<T = Record<string, unknown>>(resource: string, data: Partial<T>) {
      const items = getCollection(resource);
      const id = (data as any)?.id ?? Math.random().toString(36).slice(2, 9);
      const record = { ...(data as Record<string, unknown>), id };
      items.push(record);
      return { ...record } as unknown as T;
    },

    async update<T = Record<string, unknown>>(resource: string, id: string | number, data: Partial<T>) {
      const items = getCollection(resource);
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error(`Record ${id} not found in ${resource}`);
      const updated = { ...items[index], ...(data as Record<string, unknown>), id };
      items[index] = updated;
      return { ...updated } as unknown as T;
    },

    async delete(resource: string, id: string | number) {
      const items = getCollection(resource);
      const index = items.findIndex((item) => String(item.id) === String(id));
      if (index === -1) throw new Error(`Record ${id} not found in ${resource}`);
      items.splice(index, 1);
      return { id };
    },

    async deleteMany(resource: string, ids: Array<string | number>) {
      const idSet = new Set(ids.map(String));
      const items = getCollection(resource);
      const remaining = items.filter((item) => !idSet.has(String(item.id)));
      store.set(resource, remaining);
      return { ids };
    },
  };
}

/**
 * LocalStorage data provider for persistent browser client storage.
 */
export function createLocalStorageDataProvider(options?: {
  prefix?: string;
  storage?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  };
}): DataProvider {
  const prefix = options?.prefix ?? 'pro_data_';
  const storage = options?.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);

  const getKey = (resource: string) => `${prefix}${resource}`;

  const loadItems = (resource: string): Array<Record<string, unknown>> => {
    if (!storage) return [];
    try {
      const raw = storage.getItem(getKey(resource));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveItems = (resource: string, items: Array<Record<string, unknown>>) => {
    if (!storage) return;
    try {
      storage.setItem(getKey(resource), JSON.stringify(items));
    } catch (err) {
      console.error(`Failed to save items to storage for ${resource}`, err);
    }
  };

  return {
    async getList<T = Record<string, unknown>>(resource: string, params?: GetListParams) {
      const memoryProvider = createMemoryDataProvider({ [resource]: loadItems(resource) });
      return memoryProvider.getList<T>(resource, params);
    },

    async getOne<T = Record<string, unknown>>(resource: string, id: string | number) {
      const memoryProvider = createMemoryDataProvider({ [resource]: loadItems(resource) });
      return memoryProvider.getOne<T>(resource, id);
    },

    async create<T = Record<string, unknown>>(resource: string, data: Partial<T>) {
      const items = loadItems(resource);
      const memoryProvider = createMemoryDataProvider({ [resource]: items });
      const created = await memoryProvider.create<T>(resource, data);
      items.push(created as unknown as Record<string, unknown>);
      saveItems(resource, items);
      return created;
    },

    async update<T = Record<string, unknown>>(resource: string, id: string | number, data: Partial<T>) {
      const items = loadItems(resource);
      const memoryProvider = createMemoryDataProvider({ [resource]: items });
      const updated = await memoryProvider.update<T>(resource, id, data);
      const index = items.findIndex((i) => String(i.id) === String(id));
      if (index !== -1) items[index] = updated as unknown as Record<string, unknown>;
      saveItems(resource, items);
      return updated;
    },

    async delete(resource: string, id: string | number) {
      const items = loadItems(resource);
      const memoryProvider = createMemoryDataProvider({ [resource]: items });
      await memoryProvider.delete(resource, id);
      const filtered = items.filter((i) => String(i.id) !== String(id));
      saveItems(resource, filtered);
      return { id };
    },

    async deleteMany(resource: string, ids: Array<string | number>) {
      const items = loadItems(resource);
      const memoryProvider = createMemoryDataProvider({ [resource]: items });
      await memoryProvider.deleteMany!(resource, ids);
      const idSet = new Set(ids.map(String));
      const filtered = items.filter((i) => !idSet.has(String(i.id)));
      saveItems(resource, filtered);
      return { ids };
    },
  };
}

/**
 * Standard REST API data provider supporting query string serialization.
 */
export function createRestDataProvider(
  baseUrl: string,
  options?: {
    headers?: Record<string, string> | (() => Promise<Record<string, string>> | Record<string, string>);
    fetch?: typeof fetch;
  },
): DataProvider {
  const fetcher = options?.fetch ?? (typeof fetch !== 'undefined' ? fetch : undefined);
  if (!fetcher) throw new Error('Global fetch is not available in this environment.');

  const getHeaders = async () => {
    const custom = typeof options?.headers === 'function' ? await options.headers() : options?.headers;
    return {
      'Content-Type': 'application/json',
      ...custom,
    };
  };

  const sanitizeUrl = (url: string) => url.replace(/\/+$/, '');
  const root = sanitizeUrl(baseUrl);

  return {
    async getList<T = Record<string, unknown>>(resource: string, params?: GetListParams) {
      const query = new URLSearchParams();

      if (params?.pagination?.page) query.set('page', String(params.pagination.page));
      if (params?.pagination?.pageSize) query.set('limit', String(params.pagination.pageSize));
      if (params?.sort) {
        query.set('sort', params.sort.field);
        query.set('order', params.sort.order);
      }
      if (params?.filters) {
        for (const [key, val] of Object.entries(params.filters)) {
          if (val !== undefined && val !== null && val !== '') {
            query.set(`filter[${key}]`, String(val));
          }
        }
      }

      const qs = query.toString();
      const url = `${root}/${resource}${qs ? `?${qs}` : ''}`;
      const res = await fetcher(url, { headers: await getHeaders() });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);

      const json = (await res.json()) as any;
      if (Array.isArray(json)) {
        return { data: json as T[], total: json.length };
      }
      return {
        data: (json.data ?? json) as T[],
        total: json.total ?? json.data?.length ?? 0,
        page: json.page,
        pageSize: json.pageSize,
      };
    },

    async getOne<T = Record<string, unknown>>(resource: string, id: string | number) {
      const res = await fetcher(`${root}/${resource}/${id}`, { headers: await getHeaders() });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as any;
      return (json.data ?? json) as T;
    },

    async create<T = Record<string, unknown>>(resource: string, data: Partial<T>) {
      const res = await fetcher(`${root}/${resource}`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as any;
      return (json.data ?? json) as T;
    },

    async update<T = Record<string, unknown>>(resource: string, id: string | number, data: Partial<T>) {
      const res = await fetcher(`${root}/${resource}/${id}`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as any;
      return (json.data ?? json) as T;
    },

    async delete(resource: string, id: string | number) {
      const res = await fetcher(`${root}/${resource}/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      return { id };
    },

    async deleteMany(resource: string, ids: Array<string | number>) {
      const res = await fetcher(`${root}/${resource}/batch-delete`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      return { ids };
    },
  };
}

/**
 * SQL execution interface compatible with Tauri SQL plugin, better-sqlite3, and WebSQL.
 */
export interface SqlExecutor {
  select<T = Record<string, unknown>>(query: string, params?: unknown[]): Promise<T[]>;
  execute(query: string, params?: unknown[]): Promise<{ rowsAffected?: number; lastInsertId?: number | string }>;
}

export interface SqliteDataProviderOptions {
  executor: SqlExecutor;
  /** Primary key field name, default 'id' */
  idField?: string;
}

/**
 * SQLite data provider generating parameterized queries.
 * Ideal for Tauri SQLite (`@tauri-apps/plugin-sql`), WASM SQLite, and local embedded databases.
 */
export function createSqliteDataProvider(options: SqliteDataProviderOptions): DataProvider {
  const { executor, idField = 'id' } = options;

  return {
    async getList<T = Record<string, unknown>>(resource: string, params: GetListParams = {}): Promise<GetListResult<T>> {
      const { pagination, sort, filters } = params;
      const whereClauses: string[] = [];
      const queryParams: unknown[] = [];

      if (filters) {
        for (const [key, val] of Object.entries(filters)) {
          if (val !== undefined && val !== null && val !== '') {
            whereClauses.push(`"${key}" = ?`);
            queryParams.push(val);
          }
        }
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Total count
      const countSql = `SELECT COUNT(*) as count FROM "${resource}" ${whereSql}`;
      const countRows = await executor.select<{ count: number }>(countSql, queryParams);
      const total = Number(countRows[0]?.count ?? 0);

      // Main query
      let sql = `SELECT * FROM "${resource}" ${whereSql}`;
      const listParams = [...queryParams];

      if (sort && sort.field) {
        const order = sort.order?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        sql += ` ORDER BY "${sort.field}" ${order}`;
      }

      if (pagination && pagination.pageSize) {
        const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
        const offset = (page - 1) * pagination.pageSize;
        sql += ` LIMIT ? OFFSET ?`;
        listParams.push(pagination.pageSize, offset);
      }

      const data = await executor.select<T>(sql, listParams);
      return {
        data,
        total,
        page: pagination?.page,
        pageSize: pagination?.pageSize,
      };
    },

    async getOne<T = Record<string, unknown>>(resource: string, id: string | number): Promise<T> {
      const sql = `SELECT * FROM "${resource}" WHERE "${idField}" = ? LIMIT 1`;
      const rows = await executor.select<T>(sql, [id]);
      if (!rows.length) {
        throw new Error(`Record with ${idField} = ${id} not found in ${resource}`);
      }
      return rows[0];
    },

    async create<T = Record<string, unknown>>(resource: string, data: Partial<T>): Promise<T> {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        throw new Error('Cannot insert empty record');
      }
      const columns = entries.map(([col]) => `"${col}"`).join(', ');
      const placeholders = entries.map(() => '?').join(', ');
      const values = entries.map(([, val]) => val);

      const sql = `INSERT INTO "${resource}" (${columns}) VALUES (${placeholders})`;
      const result = await executor.execute(sql, values);

      const newId = result.lastInsertId ?? (data as any)[idField];
      if (newId !== undefined) {
        return this.getOne<T>(resource, newId);
      }
      return data as T;
    },

    async update<T = Record<string, unknown>>(resource: string, id: string | number, data: Partial<T>): Promise<T> {
      const entries = Object.entries(data).filter(([col]) => col !== idField);
      if (entries.length === 0) {
        return this.getOne<T>(resource, id);
      }
      const setClauses = entries.map(([col]) => `"${col}" = ?`).join(', ');
      const values = [...entries.map(([, val]) => val), id];

      const sql = `UPDATE "${resource}" SET ${setClauses} WHERE "${idField}" = ?`;
      await executor.execute(sql, values);
      return this.getOne<T>(resource, id);
    },

    async delete(resource: string, id: string | number): Promise<{ id: string | number }> {
      const sql = `DELETE FROM "${resource}" WHERE "${idField}" = ?`;
      await executor.execute(sql, [id]);
      return { id };
    },

    async deleteMany(resource: string, ids: Array<string | number>): Promise<{ ids: Array<string | number> }> {
      if (!ids.length) return { ids: [] };
      const placeholders = ids.map(() => '?').join(', ');
      const sql = `DELETE FROM "${resource}" WHERE "${idField}" IN (${placeholders})`;
      await executor.execute(sql, ids);
      return { ids };
    },
  };
}

export interface SupabaseDataProviderOptions {
  supabaseUrl: string;
  supabaseKey: string;
  /** Custom fetch implementation, defaults to globalThis.fetch */
  fetch?: typeof fetch;
  /** PostgREST schema, default 'public' */
  schema?: string;
}

/**
 * Supabase / PostgREST data provider with range pagination, exact counting, and filter mapping.
 */
export function createSupabaseDataProvider(options: SupabaseDataProviderOptions): DataProvider {
  const { supabaseUrl, supabaseKey, fetch: customFetch } = options;
  const fetcher = customFetch ?? globalThis.fetch;
  const baseUrl = supabaseUrl.replace(/\/+$/, '');

  const getHeaders = (extra: Record<string, string> = {}) => ({
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    ...extra,
  });

  return {
    async getList<T = Record<string, unknown>>(resource: string, params: GetListParams = {}): Promise<GetListResult<T>> {
      const { pagination, sort, filters } = params;
      const url = new URL(`${baseUrl}/rest/v1/${resource}`);

      if (filters) {
        for (const [key, val] of Object.entries(filters)) {
          if (val !== undefined && val !== null && val !== '') {
            url.searchParams.set(key, `eq.${val}`);
          }
        }
      }

      if (sort && sort.field) {
        url.searchParams.set('order', `${sort.field}.${sort.order?.toLowerCase() === 'desc' ? 'desc' : 'asc'}`);
      }

      const headers: Record<string, string> = getHeaders({
        Prefer: 'count=exact',
      });

      if (pagination && pagination.pageSize) {
        const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
        const from = (page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        headers['Range'] = `${from}-${to}`;
        headers['Range-Unit'] = 'items';
      }

      const res = await fetcher(url.toString(), { headers });
      if (!res.ok) {
        throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      }

      const contentRange = res.headers.get('content-range');
      let total = 0;
      if (contentRange) {
        const parts = contentRange.split('/');
        total = Number(parts[1]) || 0;
      }

      const data = (await res.json()) as T[];
      return {
        data,
        total: total || data.length,
        page: pagination?.page,
        pageSize: pagination?.pageSize,
      };
    },

    async getOne<T = Record<string, unknown>>(resource: string, id: string | number): Promise<T> {
      const url = `${baseUrl}/rest/v1/${resource}?id=eq.${encodeURIComponent(String(id))}`;
      const res = await fetcher(url, {
        headers: getHeaders({
          Accept: 'application/vnd.pgrst.object+json',
        }),
      });
      if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      return (await res.json()) as T;
    },

    async create<T = Record<string, unknown>>(resource: string, data: Partial<T>): Promise<T> {
      const url = `${baseUrl}/rest/v1/${resource}`;
      const res = await fetcher(url, {
        method: 'POST',
        headers: getHeaders({
          Prefer: 'return=representation',
        }),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as any;
      return Array.isArray(json) ? (json[0] as T) : (json as T);
    },

    async update<T = Record<string, unknown>>(resource: string, id: string | number, data: Partial<T>): Promise<T> {
      const url = `${baseUrl}/rest/v1/${resource}?id=eq.${encodeURIComponent(String(id))}`;
      const res = await fetcher(url, {
        method: 'PATCH',
        headers: getHeaders({
          Prefer: 'return=representation',
        }),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      const json = (await res.json()) as any;
      return Array.isArray(json) ? (json[0] as T) : (json as T);
    },

    async delete(resource: string, id: string | number): Promise<{ id: string | number }> {
      const url = `${baseUrl}/rest/v1/${resource}?id=eq.${encodeURIComponent(String(id))}`;
      const res = await fetcher(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      return { id };
    },

    async deleteMany(resource: string, ids: Array<string | number>): Promise<{ ids: Array<string | number> }> {
      if (!ids.length) return { ids: [] };
      const formatted = ids.map((id) => encodeURIComponent(String(id))).join(',');
      const url = `${baseUrl}/rest/v1/${resource}?id=in.(${formatted})`;
      const res = await fetcher(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
      return { ids };
    },
  };
}


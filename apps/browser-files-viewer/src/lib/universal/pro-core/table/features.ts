/** Feature configuration + server-mode contracts for pro data tables. */

export interface TableFeatures {
  sorting?: boolean;
  globalFilter?: boolean;
  pagination?: boolean;
  rowSelection?: boolean;
  columnVisibility?: boolean;
  refresh?: boolean;
  /** Page-size choices offered when pagination is enabled. */
  pageSizeOptions?: number[];
}

export const defaultTableFeatures: Required<Pick<TableFeatures, 'pageSizeOptions'>> = {
  pageSizeOptions: [10, 20, 50],
};

/**
 * Server-mode contract: adapters translate this into their fetcher.
 * When a table runs in client mode, all filtering happens in memory instead.
 */
export interface TableQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface PagedResult<T> {
  rows: T[];
  total: number;
}

export function buildTableQuery(params: Partial<TableQuery> & Pick<TableQuery, 'page' | 'pageSize'>): TableQuery {
  return { sortBy: undefined, sortDir: undefined, search: undefined, ...params };
}

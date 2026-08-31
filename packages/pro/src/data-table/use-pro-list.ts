import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@package/pro-core/query';

export interface ProListResult<T> {
  rows: T[];
  total: number;
  loading: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Standard list hook: pairs pro-core query keys with TanStack Query and
 * normalizes the result shape consumed by ProDataTable.
 */
export function useProList<T>(
  resource: string,
  fetcher: () => Promise<T[]> | T[],
  options: { enabled?: boolean } = {},
): ProListResult<T> {
  const query = useQuery({
    queryKey: queryKeys.table(resource, {}),
    queryFn: () => Promise.resolve(fetcher()),
    enabled: options.enabled ?? true,
  });

  const rows = Array.isArray(query.data) ? query.data : [];
  return {
    rows,
    total: rows.length,
    loading: query.isPending && options.enabled !== false,
    error: query.error ?? undefined,
    refetch: () => void query.refetch(),
  };
}

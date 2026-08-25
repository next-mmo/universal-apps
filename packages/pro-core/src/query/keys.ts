/** Deterministic query-key factories shared by every adapter. */

export const queryKeys = {
  table: (resource: string, params: Record<string, unknown>) =>
    ['pro', 'table', resource, params] as const,
  detail: (resource: string, id: string | number) => ['pro', 'detail', resource, id] as const,
  stats: (resource: string) => ['pro', 'stats', resource] as const,
};

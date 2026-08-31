import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addTodo, listTodoRows, removeTodo, toggleTodo } from './todo-service';
import { queryKeys } from '@package/pro-core/query';

import type { TodoFormValues, TodoRow } from './todo-service';
import type { ProCrudAction, ProCrudController } from '@package/pro/crud';

export function useTodos() {
  return useQuery({
    queryKey: queryKeys.table('todos', {}),
    queryFn: listTodoRows,
  });
}

export function useAddTodo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => addTodo(text),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['pro', 'table', 'todos'] }),
  });
}

export function useToggleTodo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleTodo(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['pro', 'table', 'todos'] }),
  });
}

export function useRemoveTodo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeTodo(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['pro', 'table', 'todos'] }),
  });
}

/** Controlled adapter consumed by ProCrudPage; data ownership stays in the app. */
export function useTodoCrud(): {
  controller: ProCrudController<TodoRow, TodoFormValues>;
  actions: Array<ProCrudAction<TodoRow>>;
} {
  const list = useTodos();
  const add = useAddTodo();
  const toggle = useToggleTodo();
  const remove = useRemoveTodo();
  return {
    controller: {
      rows: list.data ?? [],
      loading: list.isPending,
      error: list.error ?? undefined,
      refresh: () => list.refetch(),
      create: (values) => add.mutateAsync(values.text),
      remove: (row) => remove.mutateAsync(Number(row.id)),
    },
    actions: [{ label: 'Done', onSelect: (row) => toggle.mutateAsync(Number(row.id)) }],
  };
}

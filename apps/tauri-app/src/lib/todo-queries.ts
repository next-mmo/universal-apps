import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addTodo, listTodoRows, removeTodo, toggleTodo } from './todo-service';
import { queryKeys } from '@package/pro-core/src/query/keys';

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

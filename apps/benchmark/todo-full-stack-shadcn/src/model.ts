import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTodoStore } from '@package/tauri-api/todo-storage';
import { type Todo } from './domain';

export { selectTodos, validateTodoText } from './domain';
export type { Todo } from './domain';

export function useBenchmarkTodos() {
  const store = useMemo(() => getTodoStore(), []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;
    store.load().then((rows) => {
      if (mounted) {
        setTodos(rows as Todo[]);
        setReady(true);
      }
    }).catch((reason: unknown) => {
      if (mounted) {
        setError(reason instanceof Error ? reason.message : 'Could not load tasks');
        setReady(true);
      }
    });
    return () => { mounted = false; };
  }, [store]);

  const persist = useCallback(async (next: Todo[]) => {
    setSaving(true);
    setError(undefined);
    try {
      await store.save(next);
      setTodos(next);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save tasks');
      throw reason;
    } finally {
      setSaving(false);
    }
  }, [store]);

  const add = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return Promise.resolve(false);
    return persist([...todos, { id: Date.now(), text: clean, done: false, createdAt: Date.now() }]).then(() => true);
  }, [persist, todos]);

  const update = useCallback((id: number, text: string) => {
    const clean = text.trim();
    if (!clean) return Promise.resolve(false);
    return persist(todos.map((todo) => todo.id === id ? { ...todo, text: clean } : todo)).then(() => true);
  }, [persist, todos]);

  const toggle = useCallback((id: number) => persist(todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo)), [persist, todos]);
  const remove = useCallback((id: number) => persist(todos.filter((todo) => todo.id !== id)), [persist, todos]);
  const clearDone = useCallback(() => persist(todos.filter((todo) => !todo.done)), [persist, todos]);

  return { todos, ready, saving, error, clearError: () => setError(undefined), add, update, toggle, remove, clearDone };
}

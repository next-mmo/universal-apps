import type { Todo } from '@package/core/todo';

/**
 * View model consumed by pro blocks; derived fields keep the table DSL
 * declarative (status tones, dates) without adapters knowing about Todo.
 */
export interface TodoRow {
  id: string;
  text: string;
  createdAt: number;
  status: { label: string; variant: 'success' | 'outline' };
  priority: string;
}

export interface TodoFormValues {
  text: string;
}

function toRow(todo: Todo): TodoRow {
  return {
    id: String(todo.id),
    text: todo.text,
    createdAt: todo.id,
    status: todo.done
      ? { label: 'Done', variant: 'success' }
      : { label: 'Open', variant: 'outline' },
    priority: 'normal',
  };
}

const storageKey = 'universal-docs-todos';

function loadTodos(): Todo[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is Todo =>
            typeof value === 'object' &&
            value !== null &&
            typeof (value as Todo).id === 'number' &&
            typeof (value as Todo).text === 'string' &&
            typeof (value as Todo).done === 'boolean',
        )
      : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

export function listTodoRows(): Promise<TodoRow[]> {
  return Promise.resolve(loadTodos().map(toRow));
}

export function addTodo(text: string): Promise<void> {
  saveTodos([...loadTodos(), { id: Date.now(), text, done: false }]);
  return Promise.resolve();
}

export function toggleTodo(id: number): Promise<void> {
  const todos = loadTodos();
  const next = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  saveTodos(next);
  return Promise.resolve();
}

export function removeTodo(id: number): Promise<void> {
  saveTodos(loadTodos().filter((todo) => todo.id !== id));
  return Promise.resolve();
}

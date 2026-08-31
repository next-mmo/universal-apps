import { getTodoStore } from '@package/tauri-api/todo-storage';
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

const store = getTodoStore();

export function listTodoRows(): Promise<TodoRow[]> {
  return store.load().then((todos) => todos.map(toRow));
}

export function addTodo(text: string): Promise<void> {
  return store.load().then((todos) => store.save([...todos, { id: Date.now(), text, done: false }]));
}

export async function toggleTodo(id: number): Promise<void> {
  const todos = await store.load();
  const next = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  await store.save(next);
}

export async function removeTodo(id: number): Promise<void> {
  const todos = await store.load();
  await store.save(todos.filter((todo) => todo.id !== id));
}

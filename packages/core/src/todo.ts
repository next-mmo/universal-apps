export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function createTodo(text: string): Todo {
  return { id: Date.now(), text, done: false };
}

/**
 * Minimal persistence contract every platform implements behind the same
 * shape, so all state logic above it stays platform-independent.
 */
export interface TodoStore {
  load(): Promise<Todo[]>;
  save(todos: Todo[]): Promise<void>;
}

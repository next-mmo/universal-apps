export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
}

export function validateTodoText(value: string): string | undefined {
  return value.trim() ? undefined : 'Task text is required';
}

export function selectTodos(todos: Todo[], filter: 'all' | 'active' | 'done', search: string): Todo[] {
  const query = search.trim().toLowerCase();
  return todos.filter((todo) => filter === 'all' || (filter === 'active' ? !todo.done : todo.done)).filter((todo) => query === '' || todo.text.toLowerCase().includes(query)).sort((a, b) => b.createdAt - a.createdAt);
}

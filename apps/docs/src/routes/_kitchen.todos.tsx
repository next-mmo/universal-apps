import { createFileRoute } from '@tanstack/react-router';

import TodosPage from '../pages/todos-page';

export const Route = createFileRoute('/_kitchen/todos')({
  component: TodosPage,
});

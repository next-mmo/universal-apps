import { createFileRoute } from '@tanstack/react-router';

import DataTableBlockPage from '../pages/data-table-page';

export const Route = createFileRoute('/_kitchen/blocks/data-table')({
  component: DataTableBlockPage,
});

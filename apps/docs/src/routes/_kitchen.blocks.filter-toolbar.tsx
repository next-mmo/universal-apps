import { createFileRoute } from '@tanstack/react-router';

import FilterToolbarBlockPage from '../pages/filter-toolbar-page';

export const Route = createFileRoute('/_kitchen/blocks/filter-toolbar')({
  component: FilterToolbarBlockPage,
});

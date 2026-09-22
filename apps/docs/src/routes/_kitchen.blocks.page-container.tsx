import { createFileRoute } from '@tanstack/react-router';

import PageContainerBlockPage from '../pages/page-container-page';

export const Route = createFileRoute('/_kitchen/blocks/page-container')({
  component: PageContainerBlockPage,
});

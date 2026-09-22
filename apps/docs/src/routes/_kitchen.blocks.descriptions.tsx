import { createFileRoute } from '@tanstack/react-router';

import DescriptionsBlockPage from '../pages/descriptions-page';

export const Route = createFileRoute('/_kitchen/blocks/descriptions')({
  component: DescriptionsBlockPage,
});

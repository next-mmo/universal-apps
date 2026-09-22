import { createFileRoute } from '@tanstack/react-router';

import FormDrawerBlockPage from '../pages/form-drawer-page';

export const Route = createFileRoute('/_kitchen/blocks/form-drawer')({
  component: FormDrawerBlockPage,
});

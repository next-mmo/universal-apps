import { createFileRoute } from '@tanstack/react-router';

import FormsDemoPage from '../pages/forms-page';

export const Route = createFileRoute('/_kitchen/forms')({
  component: FormsDemoPage,
});

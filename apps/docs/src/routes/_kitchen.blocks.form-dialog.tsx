import { createFileRoute } from '@tanstack/react-router';

import FormDialogBlockPage from '../pages/form-dialog-page';

export const Route = createFileRoute('/_kitchen/blocks/form-dialog')({
  component: FormDialogBlockPage,
});

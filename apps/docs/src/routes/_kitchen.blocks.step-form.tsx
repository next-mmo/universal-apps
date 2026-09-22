import { createFileRoute } from '@tanstack/react-router';

import StepFormBlockPage from '../pages/step-form-page';

export const Route = createFileRoute('/_kitchen/blocks/step-form')({
  component: StepFormBlockPage,
});

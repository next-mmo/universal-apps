import { PageContainer } from '@package/pro/page-container';

import { ProStepFormDemo } from '../components/blocks-demos';

export default function StepFormBlockPage() {
  return (
    <PageContainer
      title='Step form block'
      description='ProStepForm walks a schema across steps with per-step validation and accumulated values.'
      breadcrumbs={['App', 'Blocks', 'Step Form']}
    >
      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProStepFormDemo />
      </div>
    </PageContainer>
  );
}

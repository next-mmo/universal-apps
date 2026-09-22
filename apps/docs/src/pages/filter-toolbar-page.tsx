import { PageContainer } from '@package/pro/page-container';

import { ProFilterToolbarDemo } from '../components/blocks-demos';

export default function FilterToolbarBlockPage() {
  return (
    <PageContainer
      title='Filter toolbar block'
      description='ProFilterToolbar collects a schema of filter fields and emits the applied query.'
      breadcrumbs={['App', 'Blocks', 'Filter Toolbar']}
    >
      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProFilterToolbarDemo />
      </div>
    </PageContainer>
  );
}

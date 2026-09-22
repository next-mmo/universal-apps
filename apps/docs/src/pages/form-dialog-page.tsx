import { PageContainer } from '@package/pro/page-container';

import { ProFormDialogDemo } from '../components/blocks-demos';

export default function FormDialogBlockPage() {
  return (
    <PageContainer
      title='Form dialog block'
      description='ProFormDialog opens a schema-driven create form inside a modal.'
      breadcrumbs={['App', 'Blocks', 'Form Dialog']}
    >
      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProFormDialogDemo />
      </div>
    </PageContainer>
  );
}

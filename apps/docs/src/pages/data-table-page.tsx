import { PageContainer } from '@package/pro/page-container';

import { ProDataTableDemo } from '../components/blocks-demos';

export default function DataTableBlockPage() {
  return (
    <PageContainer
      title='Data table block'
      description='ProDataTable with column definitions, hidden-by-default columns, and status rendering.'
      breadcrumbs={['App', 'Blocks', 'Data Table']}
    >
      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProDataTableDemo />
      </div>
    </PageContainer>
  );
}

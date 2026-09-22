import { PageContainer } from '@package/pro/page-container';

import { ProFormDrawerDemo } from '../components/blocks-demos';

export default function FormDrawerBlockPage() {
  return (
    <PageContainer
      title='Form drawer block'
      description='ProFormDrawer opens a schema-driven form in a slide-over panel.'
      breadcrumbs={['App', 'Blocks', 'Form Drawer']}
    >
      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProFormDrawerDemo />
      </div>
    </PageContainer>
  );
}

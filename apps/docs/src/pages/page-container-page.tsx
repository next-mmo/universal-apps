import { PageContainer } from '@package/pro/page-container';

import { PageContainerDemo } from '../components/blocks-demos';

export default function PageContainerBlockPage() {
  return (
    <PageContainer
      title='Page container block'
      description='PageContainer composes breadcrumbs, title block, actions, and page body.'
      breadcrumbs={['App', 'Blocks', 'Page Container']}
    >
      <PageContainerDemo />
    </PageContainer>
  );
}

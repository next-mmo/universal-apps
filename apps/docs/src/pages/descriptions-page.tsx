import { PageContainer } from '@package/pro/page-container';

import { ProDescriptionsDemo } from '../components/blocks-demos';

export default function DescriptionsBlockPage() {
  return (
    <PageContainer
      title='Descriptions block'
      description='ProDescriptions renders labelled read-only detail lists with per-item value formatting.'
      breadcrumbs={['App', 'Blocks', 'Descriptions']}
    >
      <ProDescriptionsDemo />
    </PageContainer>
  );
}

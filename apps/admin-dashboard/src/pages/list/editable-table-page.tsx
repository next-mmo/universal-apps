import { useState } from 'react';
import { PageContainer } from '@package/pro/page-container';
import { EditableProTable } from '@package/pro/editable-table';
import { Card, CardContent } from '@package/ui/card';
import { toast } from '@package/ui/toast';
import type { ProColumnDef } from '@package/pro-core/table';

interface ServiceEndpoint {
  id: string;
  name: string;
  endpoint: string;
  rateLimit: string;
  environment: 'production' | 'staging' | 'dev';
  protocol: 'gRPC' | 'REST' | 'GraphQL';
}

const INITIAL_ENDPOINTS: ServiceEndpoint[] = [
  {
    id: 'ep_1',
    name: 'Auth Gateway',
    endpoint: 'https://auth.api.acme.corp/v1',
    rateLimit: '5000 req/min',
    environment: 'production',
    protocol: 'REST',
  },
  {
    id: 'ep_2',
    name: 'Telemetry Ingestion',
    endpoint: 'telemetry.internal:4317',
    rateLimit: '25000 req/min',
    environment: 'production',
    protocol: 'gRPC',
  },
  {
    id: 'ep_3',
    name: 'Customer Graph API',
    endpoint: 'https://graph.api.acme.corp/graphql',
    rateLimit: '2000 req/min',
    environment: 'staging',
    protocol: 'GraphQL',
  },
  {
    id: 'ep_4',
    name: 'Billing Webhook Dispatcher',
    endpoint: 'https://billing.api.acme.corp/events',
    rateLimit: '1200 req/min',
    environment: 'production',
    protocol: 'REST',
  },
];

export default function EditableTablePage() {
  const [endpoints, setEndpoints] = useState<ServiceEndpoint[]>(INITIAL_ENDPOINTS);

  const columns: ProColumnDef<ServiceEndpoint>[] = [
    {
      key: 'name',
      header: 'Service Name',
      valueType: 'text',
    },
    {
      key: 'endpoint',
      header: 'URL / Ingress Target',
      valueType: 'text',
    },
    {
      key: 'protocol',
      header: 'Protocol',
      valueType: 'text',
    },
    {
      key: 'rateLimit',
      header: 'Rate Limit',
      valueType: 'text',
    },
    {
      key: 'environment',
      header: 'Environment',
      valueType: 'text',
    },
  ];

  return (
    <PageContainer
      title="Editable Ingress Services"
      description="Ant Design Pro-style EditableProTable with inline cell editing, row additions, and persistence."
      breadcrumbs={['Universal Pro', 'Data Management', 'Editable Table']}
    >
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4">
          <EditableProTable<ServiceEndpoint>
            columns={columns}
            value={endpoints}
            onChange={(newVal) => {
              setEndpoints(newVal);
            }}
            getRowId={(row) => row.id}
            recordCreatorProps={{
              position: 'bottom',
              creatorButtonText: '+ Add New Service Endpoint',
              record: () => ({
                id: `ep_${Date.now()}`,
                name: 'New Service',
                endpoint: 'https://api.acme.corp/v1',
                rateLimit: '1000 req/min',
                environment: 'dev',
                protocol: 'REST',
              }),
            }}
            editable={{
              onSave: async (row) => {
                toast.success(`Saved endpoint "${row.name}"`);
              },
              onDelete: async (row) => {
                toast.success(`Deleted endpoint "${row.name}"`);
              },
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

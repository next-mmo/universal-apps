/**
 * Live rendered demos for the Blocks docs pages.
 */
import { useState } from 'react';
import { ProDescriptions, ProDescriptionsItem } from '@package/pro/descriptions';
import { ProDataTable } from '@package/pro/data-table';
import { ProForm } from '@package/pro/form';
import { ProFormDialog } from '@package/pro/form-dialog';
import { ProFormDrawer } from '@package/pro/form-drawer';
import { ProStepForm } from '@package/pro/step-form';
import { ProFilterToolbar } from '@package/pro/filter-toolbar';
import { PageContainer } from '@package/pro/page-container';
import { Button } from '@package/ui/button';
import type { ProColumnDef } from '@package/pro-core/table';

interface DemoTask {
  id: string;
  text: string;
  priority: string;
  status: string;
}

const demoTasks: Array<DemoTask> = [
  { id: '1', text: 'Write docs', priority: 'high', status: 'In progress' },
  { id: '2', text: 'Ship release', priority: 'normal', status: 'Open' },
  { id: '3', text: 'Fix flaky e2e', priority: 'low', status: 'Open' },
  { id: '4', text: 'Update tokens', priority: 'normal', status: 'Done' },
  { id: '5', text: 'Trim bundle', priority: 'low', status: 'Done' },
  { id: '6', text: 'Add telemetry', priority: 'high', status: 'In progress' },
  { id: '7', text: 'Polish theme', priority: 'normal', status: 'Open' },
  { id: '8', text: 'Write changelog', priority: 'low', status: 'Open' },
  { id: '9', text: 'Cut v0.2', priority: 'high', status: 'Open' },
  { id: '10', text: 'Plan v0.3', priority: 'normal', status: 'Open' },
  { id: '11', text: 'Archive tickets', priority: 'low', status: 'Done' },
  { id: '12', text: 'Rotate keys', priority: 'high', status: 'Open' },
];

const taskColumns: Array<ProColumnDef<DemoTask>> = [
  { key: 'text', header: 'Task', valueType: 'text' },
  { key: 'priority', header: 'Priority', valueType: 'badge', hiddenByDefault: true },
  { key: 'status', header: 'Status', valueType: 'status' },
];

export function ProDataTableDemo() {
  return (
    <div className='mb-6'>
      <ProDataTable columns={taskColumns} data={demoTasks} getRowId={(row) => row.id} />
    </div>
  );
}

const demoFormSchema = [
  {
    title: 'Task details',
    fields: [
      { name: 'text', label: 'Task', type: 'text' as const, required: true, placeholder: 'What needs doing?' },
      { name: 'notes', label: 'Notes', type: 'textarea' as const, placeholder: 'Optional details…' },
    ],
  },
  {
    title: 'Options',
    layout: 'grid-2' as const,
    fields: [
      {
        name: 'priority',
        label: 'Priority',
        type: 'select' as const,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
        ],
      },
      { name: 'pinned', label: 'Pin to top', type: 'switch' as const },
    ],
  },
];

export function ProFormDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div className='mb-6 max-w-lg'>
      <ProForm
        schema={demoFormSchema}
        defaultValues={{ priority: 'normal', pinned: false }}
        submitLabel='Create task'
        onSubmit={async (values) => {
          setSubmitted(`submitted: ${JSON.stringify(values)}`);
        }}
      />
      {submitted ? <p className='text-muted-foreground mt-2 text-xs'>{submitted}</p> : null}
    </div>
  );
}

export function ProFormDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className='mb-6'>
      <Button variant='outline' onClick={() => setOpen(true)}>
        New task
      </Button>
      <ProFormDialog
        open={open}
        onOpenChange={setOpen}
        title='New task'
        description='Schema-driven create dialog.'
        schema={demoFormSchema.slice(0, 1)}
        defaultValues={{}}
        submitLabel='Create'
        onSubmit={async () => {
          setOpen(false);
        }}
      />
    </div>
  );
}

export function PageContainerDemo() {
  return (
    <div className='mb-6 rounded-xl border'>
      <PageContainer
        title='Todos'
        breadcrumbs={['App', 'Data', 'Todos']}
        description='Breadcrumb, title block, and actions in one scaffold.'
        extra={<Button size='sm'>New task</Button>}
      >
        <p className='text-muted-foreground text-sm'>Page body renders here.</p>
      </PageContainer>
    </div>
  );
}

const descriptionData = {
  platform: 'TanStack Start + React DOM',
  styling: 'Tailwind CSS v4 (Tokens)',
  nativeParity: true,
  componentsTotal: 31,
  offlineCapable: true,
  buildTool: 'TanStack Start',
};

export function ProDescriptionsDemo() {
  return (
    <div className='mb-6'>
      <ProDescriptions title='System Overview' bordered column={3} data={descriptionData}>
        <ProDescriptionsItem label='Platform' dataIndex='platform' />
        <ProDescriptionsItem label='Styling Engine' dataIndex='styling' />
        <ProDescriptionsItem label='Native Parity' dataIndex='nativeParity' valueType='boolean' />
        <ProDescriptionsItem label='Components Total' dataIndex='componentsTotal' valueType='badge' />
        <ProDescriptionsItem label='Offline Capable' dataIndex='offlineCapable' valueType='boolean' />
        <ProDescriptionsItem label='Build Engine' dataIndex='buildTool' valueType='code' />
      </ProDescriptions>
    </div>
  );
}

const filterFields = [
  { name: 'search', label: 'Keyword', type: 'text' as const, placeholder: 'Search audits...' },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
  },
  { name: 'date-range', label: 'Billing Period', type: 'date-range' as const },
  { name: 'date', label: 'Audit Date', type: 'date' as const },
];

export function ProFilterToolbarDemo() {
  const [applied, setApplied] = useState<string | null>(null);
  return (
    <div className='mb-6'>
      <ProFilterToolbar
        fields={filterFields}
        onFilter={(filters) => {
          setApplied(JSON.stringify(filters));
        }}
        onReset={() => {
          setApplied(null);
        }}
      />
      <p className='text-muted-foreground mt-2 text-xs'>{applied ?? 'No filter applied yet.'}</p>
    </div>
  );
}

const onboardingSteps = [
  {
    title: 'Workspace',
    description: 'Project fundamentals',
    schema: [
      {
        fields: [
          { name: 'projectName', label: 'Project Name', type: 'text' as const, required: true, placeholder: 'e.g. Acme Cloud' },
          { name: 'organization', label: 'Organization', type: 'text' as const, placeholder: 'e.g. Acme Corp' },
        ],
      },
    ],
  },
  {
    title: 'Deployment',
    description: 'Target environments',
    schema: [
      {
        fields: [
          {
            name: 'environment',
            label: 'Default Environment',
            type: 'select' as const,
            options: [
              { label: 'Production (Edge)', value: 'prod' },
              { label: 'Staging', value: 'staging' },
              { label: 'Development', value: 'dev' },
            ],
          },
          { name: 'notifyOnDeploy', label: 'Email notifications on deploy', type: 'switch' as const },
        ],
      },
    ],
  },
];

export function ProStepFormDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <div className='mb-6 max-w-2xl'>
      <ProStepForm
        steps={onboardingSteps}
        defaultValues={{
          projectName: 'Acme Mobile App',
          organization: 'Acme Global',
          environment: 'prod',
          notifyOnDeploy: true,
        }}
        onSubmit={async (values) => {
          setSubmitted(JSON.stringify(values));
        }}
      />
      {submitted ? <p className='text-muted-foreground mt-2 text-xs'>submitted: {submitted}</p> : null}
    </div>
  );
}

const drawerTaskSchema = [
  {
    title: 'Quick Task',
    fields: [
      { name: 'title', label: 'Title', type: 'text' as const, required: true, placeholder: 'e.g. Deploy release v1.0' },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select' as const,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },
];

export function ProFormDrawerDemo() {
  const [created, setCreated] = useState<string | null>(null);
  return (
    <div className='mb-6'>
      <ProFormDrawer
        trigger={<Button size='sm'>Open form drawer</Button>}
        title='New Quick Task'
        description='Slide-over form drawer powered by ProForm.'
        schema={drawerTaskSchema}
        defaultValues={{ title: '', priority: 'medium' }}
        onSubmit={async (values) => {
          setCreated(String(values.title || 'Untitled'));
          return true;
        }}
      />
      {created ? <p className='text-muted-foreground mt-2 text-xs'>created: {created}</p> : null}
    </div>
  );
}

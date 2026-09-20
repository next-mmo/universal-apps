/**
 * Live rendered demos for the Blocks docs pages.
 */
import { useState } from 'react';
import { ProDataTable } from '@package/pro/data-table';
import { ProForm } from '@package/pro/form';
import { ProFormDialog } from '@package/pro/form-dialog';
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

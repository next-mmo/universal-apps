import { useState } from 'react';

import { useAddTodo } from '../lib/todo-queries';
import { ProForm } from '@package/pro/form';
import { PageContainer } from '@package/pro/page-container';
import { Badge } from '@package/ui/badge';

const demoSchema = [
  {
    title: 'Task details',
    description: 'Every control below is a shadcn primitive bound through TanStack Form.',
    layout: 'grid-2' as const,
    fields: [
      { name: 'text', label: 'Task', type: 'text' as const, required: true, placeholder: 'What needs doing?' },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select' as const,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
        ],
        validators: [],
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea' as const,
        placeholder: 'Optional details…',
      },
      {
        name: 'urgent',
        label: 'Urgent',
        type: 'switch' as const,
        description: 'Surface this task at the top.',
        validators: [],
      },
    ],
  },
];

export default function FormsDemoPage() {
  const addTodo = useAddTodo();
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  return (
    <PageContainer
      title='Form blocks'
      description='ProForm schema-driven form with validation, groups, and submit states.'
      breadcrumbs={['App', 'Blocks', 'Forms']}
    >
      {lastAdded !== null && (
        <div className='flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-4 py-3 text-sm'>
          <Badge variant='success'>Saved</Badge>
          <span>
            Added “{lastAdded}” — it is now on the{' '}
            <a href='/todos' className='underline underline-offset-2'>
              Todos table
            </a>
            .
          </span>
        </div>
      )}

      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <ProForm
          schema={demoSchema}
          defaultValues={{ priority: 'normal', urgent: false }}
          submitLabel='Create task'
          pending={addTodo.isPending}
          onSubmit={async (values) => {
            await addTodo.mutateAsync(String(values.text));
            setLastAdded(String(values.text));
          }}
        />
      </div>
    </PageContainer>
  );
}

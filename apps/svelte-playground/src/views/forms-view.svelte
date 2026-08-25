<script lang="ts">
import { createMutation, useQueryClient } from '@tanstack/svelte-query';

import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import type { ProFormGroup } from '@package/pro-core/src/form/schema';
import PageContainer from '@package/pro-svelte/src/layout/page-container.svelte';
import ProForm from '@package/pro-svelte/src/form/pro-form.svelte';

const store = getTodoStore();
const queryClient = useQueryClient();
let savedText = $state<string | null>(null);

const demoSchema: Array<ProFormGroup> = [
  {
    title: 'Task details',
    description: 'Every control is the Svelte adapter rendering the shared pro-core schema.',
    layout: 'grid-2',
    fields: [
      {
        name: 'text',
        label: 'Task',
        type: 'text',
        required: true,
        placeholder: 'What needs doing?',
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
        ],
      },
      { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional details…' },
      { name: 'urgent', label: 'Urgent', type: 'switch', description: 'Mark as urgent.' },
    ],
  },
];

const saveMutation = createMutation(() => ({
  mutationFn: async (text: string) => {
    const todos = await store.load();
    await store.save([...todos, { id: Date.now(), text, done: false }]);
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
}));

async function handleCreate(values: Record<string, unknown>) {
  await saveMutation.mutateAsync(String(values.text));
  savedText = String(values.text);
}
</script>

<PageContainer
  title="Form blocks"
  description="Schema-driven Svelte form with validation, groups, and submit states."
  breadcrumbs={['Svelte', 'Blocks', 'Forms']}
>
  {#if savedText !== null}
    <div class="flex items-center gap-2 rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm">
      <span class="rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-medium text-green">Saved</span>
      <span>Added “{savedText}” — it is now on the Todos table.</span>
    </div>
  {/if}

  <div class="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
    <ProForm
      schema={demoSchema}
      defaultValues={{ priority: 'normal', urgent: false }}
      submitLabel="Create task"
      pending={saveMutation.isPending}
      onSubmit={handleCreate}
    />
  </div>
</PageContainer>

<script setup lang="ts">
import { ref } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import ProForm from '@package/pro-vue/src/form/pro-form.vue';
import PageContainer from '@package/pro-vue/src/layout/page-container.vue';
import type { ProFormGroup } from '@package/pro-core/src/form/schema';

const store = getTodoStore();
const queryClient = useQueryClient();
const savedText = ref<string | null>(null);

const demoSchema: Array<ProFormGroup> = [
  {
    title: 'Task details',
    description: 'Every control is the Vue adapter rendering the shared pro-core schema.',
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

async function handleCreate(values: Record<string, unknown>) {
  const todos = await store.load();
  await store.save([...todos, { id: Date.now(), text: String(values.text), done: false }]);
  savedText.value = String(values.text);
  await queryClient.invalidateQueries({ queryKey: ['todos'] });
}
</script>

<template>
  <PageContainer
    title="Form blocks"
    description="Schema-driven Vue form with validation, groups, and submit states."
    :breadcrumbs="['Vue', 'Blocks', 'Forms']"
  >
    <div
      v-if="savedText !== null"
      class="flex items-center gap-2 rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm"
    >
      <span class="rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-medium text-green">Saved</span>
      <span>Added “{{ savedText }}” — it is now on the Todos table.</span>
    </div>

    <div class="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <ProForm
        :schema="demoSchema"
        :default-values="{ priority: 'normal', urgent: false }"
        submit-label="Create task"
        :on-submit="handleCreate"
      />
    </div>
  </PageContainer>
</template>

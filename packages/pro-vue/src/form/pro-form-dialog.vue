<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

import ProForm from './pro-form.vue';

import type { ProFormGroup, ProFormValues } from '@package/pro-core/src/form/schema';

defineProps<{
  open: boolean;
  title: string;
  description?: string;
  schema: Array<ProFormGroup>;
  defaultValues: ProFormValues;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (values: ProFormValues) => Promise<void> | void;
}>();

const emit = defineEmits<{ 'update:open': [open: boolean] }>();

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('update:open', false);
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="pro-dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
        @click.self="emit('update:open', false)"
      >
        <div class="w-full max-w-lg rounded-2xl border border-border bg-popover p-6 shadow-[var(--shadow-overlay)]">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold tracking-[-0.02em]">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              class="rounded-lg px-2 py-1 text-muted-foreground hover:bg-accent"
              @click="emit('update:open', false)"
            >
              ✕
            </button>
          </div>

          <ProForm
            v-if="open"
            :key="JSON.stringify(defaultValues)"
            :schema="schema"
            :default-values="defaultValues"
            :submit-label="submitLabel"
            :pending="pending"
            :on-cancel="() => emit('update:open', false)"
            :on-submit="
              async (values: ProFormValues) => {
                await onSubmit(values);
                emit('update:open', false);
              }
            "
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pro-dialog-enter-active,
.pro-dialog-leave-active {
  transition: opacity 150ms ease;
}
.pro-dialog-enter-active > div,
.pro-dialog-leave-active > div {
  transition: transform 150ms ease;
}
.pro-dialog-enter-from,
.pro-dialog-leave-to {
  opacity: 0;
}
.pro-dialog-enter-from > div {
  transform: scale(0.96);
}
.pro-dialog-leave-to > div {
  transform: scale(0.96);
}
</style>

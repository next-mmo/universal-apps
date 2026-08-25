<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { validateField } from '@package/pro-core/src/form/schema';

import type { ProFieldSchema, ProFormGroup, ProFormValues } from '@package/pro-core/src/form/schema';

const props = withDefaults(
  defineProps<{
    schema: Array<ProFormGroup>;
    defaultValues: ProFormValues;
    submitLabel?: string;
    cancelLabel?: string;
    pending?: boolean;
    onSubmit: (values: ProFormValues) => Promise<void> | void;
    onCancel?: () => void;
  }>(),
  { submitLabel: 'Save', cancelLabel: 'Cancel', pending: false },
);

const values = ref<ProFormValues>({ ...props.defaultValues });
const errors = ref<Record<string, string>>({});
const submitting = ref(false);

// Reset the local copy when the parent reuses this component with new
// defaults (create vs edit flows in dialogs).
watch(
  () => JSON.stringify(props.defaultValues),
  () => {
    values.value = { ...props.defaultValues };
    errors.value = {};
  },
);

function validateOne(schema: ProFieldSchema): boolean {
  const error = validateField(schema, values.value[schema.name]);
  if (error) errors.value = { ...errors.value, [schema.name]: error };
  else {
    const next = { ...errors.value };
    delete next[schema.name];
    errors.value = next;
  }
  return error === undefined;
}

async function handleSubmit() {
  let valid = true;
  for (const group of props.schema) {
    for (const field of group.fields) {
      if (!validateOne(field)) valid = false;
    }
  }
  if (!valid) return;
  submitting.value = true;
  try {
    await props.onSubmit({ ...values.value });
  } finally {
    submitting.value = false;
  }
}

function fieldId(name: string) {
  return `pro-vue-field-${name}`;
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleSubmit" @reset.prevent="onCancel?.()">
    <section v-for="(group, gi) in schema" :key="gi" class="flex flex-col gap-4">
      <div v-if="group.title || group.description" class="flex flex-col gap-0.5 pb-1">
        <h3 v-if="group.title" class="text-sm font-semibold">{{ group.title }}</h3>
        <p v-if="group.description" class="text-xs text-muted-foreground">{{ group.description }}</p>
      </div>

      <div :class="group.layout === 'grid-2' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'flex flex-col gap-4'">
        <div v-for="field in group.fields" :key="field.name" class="flex flex-col gap-2">
          <label
            v-if="field.type !== 'checkbox' && field.type !== 'switch'"
            :for="fieldId(field.name)"
            class="text-sm font-medium"
          >
            {{ field.label }}
          </label>

          <textarea
            v-if="field.type === 'textarea'"
            :id="fieldId(field.name)"
            v-model="values[field.name] as string"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            class="min-h-16 w-full rounded-[10px] border border-input bg-fill px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
          />
          <input
            v-else-if="field.type === 'number'"
            :id="fieldId(field.name)"
            v-model.number="values[field.name]"
            type="number"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            class="h-9 w-full rounded-[10px] border border-input bg-fill px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
          />
          <select
            v-else-if="field.type === 'select'"
            :id="fieldId(field.name)"
            v-model="values[field.name] as string"
            :disabled="field.disabled"
            class="h-9 w-full rounded-[10px] border border-input bg-fill px-2.5 text-sm outline-none focus:border-primary/60 focus:bg-card"
          >
            <option v-for="option in field.options ?? []" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <label v-else-if="field.type === 'switch'" class="inline-flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-fill p-[2px] transition-colors has-[input:checked]:bg-green">
            <input
              v-model="values[field.name] as boolean"
              type="checkbox"
              class="peer sr-only"
              role="switch"
            />
            <span class="size-[27px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
          <label v-else-if="field.type === 'checkbox'" class="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              v-model="values[field.name] as boolean"
              type="checkbox"
              class="size-4 rounded accent-[var(--primary)]"
            />
            {{ field.placeholder ?? field.label }}
          </label>
          <input
            v-else
            :id="fieldId(field.name)"
            v-model="values[field.name] as string"
            type="text"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            class="h-9 w-full rounded-[10px] border border-input bg-fill px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
          />

          <p v-if="errors[field.name]" class="text-xs font-medium text-destructive" role="alert">
            {{ errors[field.name] }}
          </p>
          <p v-else-if="field.description && field.type !== 'switch'" class="text-xs text-muted-foreground">
            {{ field.description }}
          </p>
        </div>
      </div>
    </section>

    <div class="flex items-center justify-end gap-2 border-t pt-4">
      <button
        v-if="onCancel !== undefined || onCancel !== null"
        type="reset"
        class="h-9 rounded-[10px] border border-border bg-card px-4 text-sm font-medium hover:bg-accent active:scale-[0.98]"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="submit"
        :disabled="pending || submitting"
        class="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        {{ pending || submitting ? 'Saving…' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { validateField } from '@package/pro-core/src/form/schema';

import type { Snippet } from 'svelte';
import type { ProFormGroup, ProFormValues } from '@package/pro-core/src/form/schema';

interface Props {
  schema: Array<ProFormGroup>;
  defaultValues: ProFormValues;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onSubmit: (values: ProFormValues) => Promise<void> | void;
  onCancel?: () => void;
  children?: Snippet;
}

let {
  schema,
  defaultValues,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  pending = false,
  onSubmit,
  onCancel,
}: Props = $props();

let values = $state<ProFormValues>({ ...defaultValues });
let errors = $state<Record<string, string>>({});
let submitting = $state(false);

const submittingNow = $derived(pending || submitting);

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  let valid = true;
  const nextErrors: Record<string, string> = {};
  for (const group of schema) {
    for (const field of group.fields) {
      const error = validateField(field, values[field.name]);
      if (error !== undefined) {
        nextErrors[field.name] = error;
        valid = false;
      }
    }
  }
  errors = nextErrors;
  if (!valid) return;
  submitting = true;
  try {
    await onSubmit({ ...values });
  } finally {
    submitting = false;
  }
}
</script>

<form class="flex flex-col gap-6" onsubmit={handleSubmit}>
  {#each schema as group, gi (gi)}
    <section class="flex flex-col gap-4">
      {#if group.title !== undefined || group.description !== undefined}
        <div class="flex flex-col gap-0.5 pb-1">
          {#if group.title !== undefined}<h3 class="text-sm font-semibold">{group.title}</h3>{/if}
          {#if group.description !== undefined}
            <p class="text-xs text-muted-foreground">{group.description}</p>
          {/if}
        </div>
      {/if}

      <div
        class={group.layout === 'grid-2'
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
          : 'flex flex-col gap-4'}
      >
        {#each group.fields as field (field.name)}
          <div class="flex flex-col gap-2">
            {#if field.type !== 'checkbox' && field.type !== 'switch'}
              <label for={"pro-sv-" + field.name} class="text-sm font-medium">{field.label}</label>
            {/if}

            {#if field.type === 'textarea'}
              <textarea
                id={"pro-sv-" + field.name}
                class="min-h-16 w-full rounded-[10px] border border-input bg-fill px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
                placeholder={field.placeholder}
                disabled={field.disabled}
                bind:value={values[field.name] as string}
              />
            {:else if field.type === 'number'}
              <input
                id={"pro-sv-" + field.name}
                type="number"
                class="h-9 w-full rounded-[10px] border border-input bg-fill px-3 text-sm outline-none focus:border-primary/60 focus:bg-card"
                placeholder={field.placeholder}
                disabled={field.disabled}
                bind:value={values[field.name]}
              />
            {:else if field.type === 'select'}
              <select
                id={"pro-sv-" + field.name}
                class="h-9 w-full rounded-[10px] border border-input bg-fill px-2.5 text-sm outline-none focus:border-primary/60 focus:bg-card"
                disabled={field.disabled}
                bind:value={values[field.name] as string}
              >
                {#each field.options ?? [] as option (option.value)}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            {:else if field.type === 'switch'}
              <label
                class="inline-flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-fill p-[2px] transition-colors has-[input:checked]:bg-green"
              >
                <input
                  type="checkbox"
                  class="peer sr-only"
                  role="switch"
                  bind:checked={values[field.name] as boolean}
                />
                <span
                  class="size-[27px] rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
                />
              </label>
            {:else if field.type === 'checkbox'}
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  class="size-4 rounded accent-[var(--primary)]"
                  bind:checked={values[field.name] as boolean}
                />
                {field.placeholder ?? field.label}
              </label>
            {:else}
              <input
                id={"pro-sv-" + field.name}
                type="text"
                class="h-9 w-full rounded-[10px] border border-input bg-fill px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:bg-card focus:ring-[3px] focus:ring-ring/30"
                placeholder={field.placeholder}
                disabled={field.disabled}
                bind:value={values[field.name] as string}
              />
            {/if}

            {#if errors[field.name] !== undefined}
              <p class="text-xs font-medium text-destructive" role="alert">{errors[field.name]}</p>
            {:else if field.description !== undefined && field.type !== 'switch'}
              <p class="text-xs text-muted-foreground">{field.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}

  <div class="flex items-center justify-end gap-2 border-t pt-4">
    {#if onCancel !== undefined}
      <button
        type="button"
        class="h-9 rounded-[10px] border border-border bg-card px-4 text-sm font-medium hover:bg-accent active:scale-[0.98]"
        onclick={onCancel}
      >
        {cancelLabel}
      </button>
    {/if}
    <button
      type="submit"
      disabled={submittingNow}
      class="h-9 rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
    >
      {submittingNow ? 'Saving…' : submitLabel}
    </button>
  </div>
</form>

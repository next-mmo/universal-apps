<script lang="ts">
  const items = [
    {
      value: 'item-1',
      question: 'Is it accessible?',
      answer: 'Yes. Markup and state are plain Svelte with the shared design tokens.',
    },
    {
      value: 'item-2',
      question: 'Is it animated?',
      answer: 'Panels toggle with Svelte transitions; the tokens stay identical across frameworks.',
    },
    {
      value: 'item-3',
      question: 'Can multiple panels stay open?',
      answer: 'Yes — track a set of open values instead of a single one.',
    },
  ];

  let open = $state<string | null>(null);
  const toggle = (value: string) => {
    open = open === value ? null : value;
  };
</script>

<div class="mx-auto w-full max-w-sm">
  {#each items as item (item.value)}
    <div class="border-b border-border">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground"
        aria-expanded={open === item.value}
        onclick={() => toggle(item.value)}
      >
        {item.question}
        <span class="text-muted-foreground transition-transform" class:rotate-180={open === item.value}>⌄</span>
      </button>
      {#if open === item.value}
        <p class="pb-4 text-sm text-muted-foreground">{item.answer}</p>
      {/if}
    </div>
  {/each}
</div>

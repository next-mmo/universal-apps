<script lang="ts">
  let priority = $state('normal');
</script>

<select
  bind:value={priority}
  aria-label="Priority"
  class="h-9 w-44 rounded-[10px] border border-input bg-transparent px-3 text-sm text-foreground"
>
  <option value="low">Low</option>
  <option value="normal">Normal</option>
  <option value="high">High</option>
</select>

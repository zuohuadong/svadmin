<script lang="ts">
  import { AutoTable } from '@svadmin/ui';

  let { resourceName = 'products' } = $props<{ resourceName?: string }>();
</script>

<AutoTable {resourceName} />

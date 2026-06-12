<script lang="ts">
  import { AutoTable } from '@svadmin/ui';

  let { resourceName } = $props<{ resourceName: string }>();
</script>

<AutoTable {resourceName} />

<script lang="ts">
  import { AutoTable } from '@svadmin/ui';

  let { resourceName = 'calendar_events' } = $props<{ resourceName?: string }>();
</script>

<AutoTable {resourceName} />

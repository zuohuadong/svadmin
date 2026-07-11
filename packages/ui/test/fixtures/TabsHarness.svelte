<script lang="ts">
	import * as Tabs from '../../src/components/ui/tabs/index.js';

	let value = $state('state');
	let changes = $state<string[]>([]);
</script>

<Tabs.Root bind:value onValueChange={(next) => (changes = [...changes, next])}>
	<Tabs.List aria-label="Developer tools">
		<Tabs.Trigger value="state">State</Tabs.Trigger>
		<Tabs.Trigger value="inferencer">Inferencer</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="state">State panel</Tabs.Content>
	<Tabs.Content value="inferencer">Inferencer panel</Tabs.Content>
</Tabs.Root>

<output data-testid="tabs-value">{value}</output>
<output data-testid="tabs-changes">{changes.join(',')}</output>

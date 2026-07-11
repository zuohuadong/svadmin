<script lang="ts">
	import TooltipButton from '../../src/components/TooltipButton.svelte';

	let visible = $state(true);
	let navigations = $state(0);

	function navigateAway() {
		navigations += 1;
		visible = false;
	}
</script>

{#if visible}
	<TooltipButton
		tooltip="Edit record"
		aria-describedby="existing-tooltip-description"
		onclick={navigateAway}
	>
		Edit
	</TooltipButton>
{:else}
	<button type="button" data-testid="tooltip-reset" onclick={() => (visible = true)}>Reset</button>
{/if}

<span id="existing-tooltip-description">Existing description</span>
<output data-testid="tooltip-navigations">{navigations}</output>

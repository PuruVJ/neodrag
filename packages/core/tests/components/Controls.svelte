<script lang="ts">
	import type { PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		priority_type?: 'allow-block' | 'allow-block-allow' | 'block-allow-block';
	};

	const { plugins, priority_type }: Props = $props();

	// const plugin_args = $derived.by<Parameters<typeof controls>[0]>(() => {
	// 	if (data.type === 'undefined,null') {
	// 		return undefined;
	// 	} else if (data.type === 'allow-only') {
	// 		return { allow: ControlFrom.selector('.handle') };
	// 	} else if (data.type === 'block-only') {
	// 		return { block: ControlFrom.selector('.cancel') };
	// 	} else if (data.type === 'allow-block') {
	// 		return {
	// 			allow: ControlFrom.selector('.handle'),
	// 			block: ControlFrom.selector('.cancel'),
	// 		};
	// 	} else if (data.type === 'allow-block-allow') {
	// 		return {
	// 			allow: ControlFrom.selector('.handle, .handle2'),
	// 			block: ControlFrom.selector('.cancel'),
	// 			priority: 'allow',
	// 		};
	// 	} else if (data.type === 'block-allow-block') {
	// 		return {
	// 			allow: ControlFrom.selector('.middle-handle'),
	// 			block: ControlFrom.selector('.outer-handle, .inner-handle'),
	// 			priority: 'block',
	// 		};
	// 	}
	// });

	// let is_mounted = $state(false);
	// $effect(() => {
	// 	is_mounted = true;
	// });
</script>

<Box {plugins}>
	{#if priority_type === 'allow-block'}
		<div data-testid="handle">
			Handle
			<br /><br />
			<div data-testid="cancel">Cancel</div>
		</div>
	{:else if priority_type === 'allow-block-allow'}
		<div data-testid="handle">
			<span data-testid="handle-text"> Handle </span>

			<div data-testid="cancel">
				<span data-testid="cancel-text">Cancel</span>

				<div data-testid="handle2">Handle2</div>
			</div>
		</div>
	{:else if priority_type === 'block-allow-block'}
		<div data-testid="outer-cancel">
			<span data-testid="outer-text">Outer Block</span>

			<div data-testid="middle-handle">
				<span data-testid="middle-text">Middle Allow</span>

				<div data-testid="inner-cancel">
					<span data-testid="inner-text">Inner Block</span>
				</div>
			</div>
		</div>
	{:else}
		<div data-testid="handle">Handle</div>
		<div data-testid="cancel">Cancel</div>
	{/if}
</Box>

<script lang="ts">
	import type { PluginInput } from '../../src/plugins';
	import Box from './Box.svelte';

	type Props = {
		plugins: PluginInput;
		priority_type?:
			| 'allow-block'
			| 'allow-block-allow'
			| 'block-allow-block'
			| 'allow-only-bug-test'
			| 'allow-with-priority-block-bug-test';
	};

	const { plugins, priority_type }: Props = $props();
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
	{:else if priority_type === 'allow-only-bug-test' || priority_type === 'allow-with-priority-block-bug-test'}
		<!-- Layout for testing the specific bug scenarios -->
		<div data-testid="container">
			<div data-testid="handle">Handle (should be draggable)</div>
			<div data-testid="content">Content (should NOT be draggable)</div>
			<div data-testid="footer">Footer (should NOT be draggable)</div>
		</div>
	{:else}
		<div data-testid="handle">Handle</div>
		<div data-testid="cancel">Cancel</div>
	{/if}
</Box>

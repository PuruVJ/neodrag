import { DragEventData } from '.';

export declare namespace svelte.JSX {
	interface HTMLAttributes {
		'onneodrag:start'?: (e: CustomEvent<DragEventData>) => void;
		'onneodrag:end'?: (e: CustomEvent<DragEventData>) => void;
		onneodrag?: (e: CustomEvent<DragEventData>) => void;
	}
}

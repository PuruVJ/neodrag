export declare namespace svelte.JSX {
	interface HTMLAttributes {
		'onneodrag:start'?: (
			e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
		) => void;
		'onneodrag:end'?: (
			e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
		) => void;
		onneodrag?: (e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>) => void;
	}
}

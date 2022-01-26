export declare namespace svelte.JSX {
	interface HTMLAttributes {
		'onsvelte-drag:start'?: (
			e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
		) => void;
		'onsvelte-drag:end'?: (
			e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
		) => void;
		'onsvelte-drag'?: (
			e: CustomEvent<{ offsetX: number; offsetY: number; domRect: DOMRect }>
		) => void;
	}
}

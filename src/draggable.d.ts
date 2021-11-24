export declare namespace svelte.JSX {
	interface HTMLAttributes {
		'onsvelte-drag:start'?: (e: CustomEvent<null>) => void;
		'onsvelte-drag:end'?: (e: CustomEvent<null>) => void;
		'onsvelte-drag'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
	}
}

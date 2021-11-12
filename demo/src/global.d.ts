/// <reference types="@sveltejs/kit" />

export declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    'onsvelte-drag:start'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
    'onsvelte-drag:end'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
    'onsvelte-drag'?: (e: CustomEvent<{ offsetX: number; offsetY: number }>) => void;
  }
}

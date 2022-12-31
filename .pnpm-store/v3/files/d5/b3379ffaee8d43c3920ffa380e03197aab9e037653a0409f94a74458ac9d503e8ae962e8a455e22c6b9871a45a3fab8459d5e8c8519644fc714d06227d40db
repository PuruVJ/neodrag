declare type directiveAstroKeys = 'load' | 'idle' | 'visible' | 'media' | 'only';
declare const Astro: {
    [k in directiveAstroKeys]?: (fn: () => Promise<() => void>, opts: Record<string, any>, root: HTMLElement) => void;
};

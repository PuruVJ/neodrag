import type { Framework } from './constants';

type FrameworkRoute = Framework | 'core';

const BRAND_LCH: Record<FrameworkRoute, string> = {
	svelte: 'lch(51.55% 90.27 44.76)',
	react: 'lch(57.76% 33.42 224.77)',
	vue: 'lch(61.2% 45.16 159.22)',
	solid: 'lch(33.15% 29.98 275.63)',
	vanilla: 'lch(79.75% 80.99 94.66)',
	core: 'lch(34.59% 59.96 26.65)',
};

export function framework_brand_var(framework: FrameworkRoute) {
	return `--app-color-brand-${framework}`;
}

export function critical_framework_css(framework: FrameworkRoute) {
	const token = framework_brand_var(framework);
	const lch = BRAND_LCH[framework];

	return `html{--app-color-anti-mixer:black;--app-color-shell:hsl(200,8%,100%);--app-color-shell-mix:hsl(200,8%,100%)}
html[data-theme=dark]{--app-color-anti-mixer:white;--app-color-shell:#101213;--app-color-shell-mix:lch(8.2% 2.8 252)}
html[data-framework=${framework}]{${token}:color-mix(in lch,${lch},var(--app-color-anti-mixer) 15%);--color-brand:var(${token});--secondary-color:var(${token})}
html[data-framework=${framework}] .docs-page-grid{--docs-grid-accent:var(${token});background-color:color-mix(in lch,var(--app-color-shell-mix),var(${token}) 1.75%)}
html[data-theme=dark][data-framework=${framework}] .docs-page-grid{background-color:color-mix(in lch,var(--app-color-shell-mix),var(${token}) 2.25%)}
html[data-framework=${framework}] .dock-host,html[data-framework=${framework}] .dock-surface{--color-brand:var(${token});--secondary-color:var(${token})}`;
}

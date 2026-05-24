export * from './index.ts';
export { Neodrag, type EngineOptions } from './interactions/engine.ts';

export function createBrowserNeodrag(
	options: Omit<import('./interactions/engine.ts').EngineOptions, 'delegate'> & {
		delegate?: () => HTMLElement;
	} = {},
) {
	return new Neodrag({
		...options,
		delegate: options.delegate ?? (() => document.documentElement),
	});
}

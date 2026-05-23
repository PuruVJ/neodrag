export * from './interactions/plugins/index.ts';
export { Compartment } from './interactions/compartment.ts';
export { resolveDragPlugins, collectCompartments } from './interactions/resolve-plugins.ts';
export {
	defineDragPlugin,
	type DragPlugin as Plugin,
	type DragPluginEntry,
	type DragPluginInput as PluginInput,
	type DragCtx as PluginContext,
} from './interactions/types.ts';
export type { DragEventData } from './interactions/plugins/events.ts';
